import { Asset } from 'expo-asset';

import { encodeWav } from '@/features/speaking/wav';
import type {
  AudioPlaybackState,
  AudioPlayOptions,
  AudioService,
} from '@/services/audio-service';
import type { AudioSource } from '@/types';

const PROGRESS_INTERVAL_MS = 100;

/**
 * Plays the bundled recordings in the browser through one shared audio
 * element. iPhone only lets a page start sound by itself (a new card playing
 * its word) on an element that a tap has already played, so the first tap
 * anywhere in the app plays a moment of silence on it; after that every
 * recording, tapped or automatic, plays on the same element.
 */
export class WebAudioService implements AudioService {
  private readonly assets: Readonly<Record<string, number>>;
  private media: HTMLAudioElement | null = null;
  private state: AudioPlaybackState = 'idle';
  private finishCurrent: ((error?: Error) => void) | null = null;
  private unlocked = false;

  constructor(assets: Readonly<Record<string, number>>) {
    this.assets = assets;
  }

  has(source: AudioSource): boolean {
    return this.assets[source.key] !== undefined;
  }

  getState(): AudioPlaybackState {
    return this.state;
  }

  /**
   * Unlocks the audio element on the first tap (call once when the app
   * starts). Returns a function that stops listening.
   */
  listenForFirstTap(target: Pick<EventTarget, 'addEventListener' | 'removeEventListener'>) {
    const stopListening = () => {
      target.removeEventListener('touchend', onTap, true);
      target.removeEventListener('click', onTap, true);
    };
    const onTap = () => {
      if (this.unlocked) {
        stopListening();
      } else {
        this.unlock();
      }
    };
    target.addEventListener('touchend', onTap, true);
    target.addEventListener('click', onTap, true);
    return stopListening;
  }

  private unlock() {
    if (this.state !== 'idle') {
      return;
    }
    const media = this.element();
    media.src = silenceUrl();
    media.play().then(
      () => {
        this.unlocked = true;
      },
      () => {},
    );
  }

  async play(source: AudioSource, options?: AudioPlayOptions): Promise<void> {
    const asset = this.assets[source.key];
    if (asset === undefined) {
      throw new Error(`No prerecorded audio for ${source.key}.`);
    }

    this.finishCurrent?.();
    const media = this.element();
    media.pause();
    this.state = 'loading';

    await new Promise<void>((resolve, reject) => {
      let timer: ReturnType<typeof setInterval> | null = null;
      const rate = options?.playbackRate ?? 1;

      const finish = (error?: Error) => {
        if (this.finishCurrent !== finish) {
          return;
        }
        this.finishCurrent = null;
        this.state = 'idle';
        media.removeEventListener('ended', onEnded);
        media.removeEventListener('error', onError);
        if (timer !== null) {
          clearInterval(timer);
        }
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      };
      const onEnded = () => finish();
      const onError = () => finish(new Error(`Could not load the recording for ${source.key}.`));
      this.finishCurrent = finish;

      media.addEventListener('ended', onEnded);
      media.addEventListener('error', onError);
      media.src = Asset.fromModule(asset).uri;
      media.preservesPitch = true;
      media.defaultPlaybackRate = rate;
      media.playbackRate = rate;
      media.play().then(
        () => {
          if (this.finishCurrent !== finish) {
            return;
          }
          this.unlocked = true;
          this.state = 'playing';
          // Safari may reset the speed when a new recording loads.
          media.playbackRate = rate;
          timer = setInterval(() => options?.onProgress?.(media.currentTime), PROGRESS_INTERVAL_MS);
        },
        (error: unknown) => finish(error instanceof Error ? error : new Error(String(error))),
      );
    });
  }

  async stop(): Promise<void> {
    this.finishCurrent?.();
    this.media?.pause();
    this.state = 'idle';
  }

  private element(): HTMLAudioElement {
    if (!this.media) {
      this.media = new Audio();
      this.media.preload = 'auto';
    }
    return this.media;
  }
}

let silence: string | null = null;

/** A tenth of a second of silence, played on the first tap to unlock the audio element. */
function silenceUrl(): string {
  silence ??= URL.createObjectURL(
    new Blob([encodeWav(new Int16Array(1600), 16000) as BlobPart], { type: 'audio/wav' }),
  );
  return silence;
}
