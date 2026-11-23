import type { AudioSource } from '@/types';

export type AudioPlaybackState = 'idle' | 'loading' | 'playing' | 'paused';

export type AudioPlayOptions = {
  /** 1 plays at normal speed; values below 1 play slower without changing the voice's pitch. */
  playbackRate?: number;
  /** Called a few times per second with the playback position, in seconds. */
  onProgress?: (seconds: number) => void;
  /**
   * Started by the app (a new card saying its word), not by a tap. If the
   * phone does not allow it, nothing else plays and no error is shown.
   */
  automatic?: boolean;
};

export interface AudioService {
  getState(): AudioPlaybackState;
  play(source: AudioSource, options?: AudioPlayOptions): Promise<void>;
  stop(): Promise<void>;
}

/** An audio service with its own recordings, which knows which ones it has. */
export interface RecordedAudioService extends AudioService {
  has(source: AudioSource): boolean;
}
