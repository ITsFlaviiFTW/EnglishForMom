import type { AudioSource } from '@/types';

export type AudioPlaybackState = 'idle' | 'loading' | 'playing' | 'paused';

export interface AudioService {
  getState(): AudioPlaybackState;
  play(source: AudioSource): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
}
