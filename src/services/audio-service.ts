import type { AudioSource } from '@/types';

export type AudioPlaybackState = 'idle' | 'loading' | 'playing' | 'paused';

export type AudioPlayOptions = {
  /** 1 plays at normal speed; values below 1 play slower without changing the voice's pitch. */
  playbackRate?: number;
  /** Called a few times per second with the playback position, in seconds. */
  onProgress?: (seconds: number) => void;
};

export interface AudioService {
  getState(): AudioPlaybackState;
  play(source: AudioSource, options?: AudioPlayOptions): Promise<void>;
  stop(): Promise<void>;
}
