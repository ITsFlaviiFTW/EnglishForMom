import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

import type { AudioPlaybackState, AudioService } from '@/services/audio-service';
import type { AudioSource } from '@/types';

export class PrerecordedAudioService implements AudioService {
  private readonly assets: Readonly<Record<string, number>>;
  private state: AudioPlaybackState = 'idle';
  private operationId = 0;
  private player: AudioPlayer | null = null;
  private finishCurrent: (() => void) | null = null;

  constructor(assets: Readonly<Record<string, number>>) {
    this.assets = assets;
  }

  has(source: AudioSource): boolean {
    return this.assets[source.key] !== undefined;
  }

  getState(): AudioPlaybackState {
    return this.state;
  }

  async play(source: AudioSource): Promise<void> {
    const asset = this.assets[source.key];
    if (asset === undefined) {
      throw new Error(`No prerecorded audio for ${source.key}.`);
    }

    const operationId = ++this.operationId;
    this.releaseCurrent();
    this.state = 'loading';

    try {
      await new Promise<void>((resolve, reject) => {
        let settled = false;
        const player = createAudioPlayer(asset, { updateInterval: 100 });
        this.player = player;

        const subscription = player.addListener('playbackStatusUpdate', (status) => {
          if (operationId !== this.operationId) {
            return;
          }

          if (status.error) {
            finish(new Error(status.error));
          } else if (status.didJustFinish) {
            finish();
          } else if (status.playing) {
            this.state = 'playing';
          }
        });

        const finish = (error?: Error) => {
          if (settled) {
            return;
          }

          settled = true;
          subscription.remove();
          this.finishCurrent = null;
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        };

        this.finishCurrent = () => finish();
        player.play();
      });
    } finally {
      if (operationId === this.operationId) {
        this.releaseCurrent();
        this.state = 'idle';
      }
    }
  }

  async stop(): Promise<void> {
    this.operationId += 1;
    this.releaseCurrent();
    this.state = 'idle';
  }

  private releaseCurrent() {
    this.finishCurrent?.();
    this.finishCurrent = null;
    this.player?.remove();
    this.player = null;
  }
}
