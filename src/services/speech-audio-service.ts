import type { AudioPlaybackState, AudioService } from '@/services/audio-service';
import type { AudioSource } from '@/types';

export type SpeechCallbacks = {
  language: string;
  rate: number;
  onStart: () => void;
  onDone: () => void;
  onStopped: () => void;
  onError: (error: Error) => void;
};

export interface SpeechEngine {
  speak(text: string, callbacks: SpeechCallbacks): void;
  stop(): Promise<void>;
}

export class SpeechAudioService implements AudioService {
  private readonly engine: SpeechEngine;
  private state: AudioPlaybackState = 'idle';
  private operationId = 0;
  private finishCurrent: (() => void) | null = null;

  constructor(engine: SpeechEngine) {
    this.engine = engine;
  }

  getState(): AudioPlaybackState {
    return this.state;
  }

  async play(source: AudioSource): Promise<void> {
    const operationId = ++this.operationId;

    this.finishCurrent?.();
    this.finishCurrent = null;
    this.state = 'loading';

    try {
      await this.engine.stop();

      if (operationId !== this.operationId) {
        return;
      }

      await new Promise<void>((resolve, reject) => {
        let settled = false;

        const finish = (error?: Error) => {
          if (settled) {
            return;
          }

          settled = true;
          this.finishCurrent = null;
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        };

        this.finishCurrent = () => finish();

        this.engine.speak(source.text, {
          language: source.locale ?? 'en-US',
          rate: source.rate ?? 0.85,
          onStart: () => {
            if (operationId === this.operationId) {
              this.state = 'playing';
            }
          },
          onDone: () => finish(),
          onStopped: () => finish(),
          onError: (error) => finish(error),
        });
      });
    } finally {
      if (operationId === this.operationId) {
        this.state = 'idle';
        this.finishCurrent = null;
      }
    }
  }

  async stop(): Promise<void> {
    this.operationId += 1;
    this.finishCurrent?.();
    this.finishCurrent = null;
    this.state = 'idle';
    await this.engine.stop();
  }
}
