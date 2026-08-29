import type { AudioPlaybackState, AudioService } from '@/services/audio-service';
import type { PrerecordedAudioService } from '@/services/prerecorded-audio-service';
import type { AudioSource } from '@/types';

export class FallbackAudioService implements AudioService {
  private readonly prerecorded: PrerecordedAudioService;
  private readonly fallback: AudioService;
  private active: AudioService | null = null;
  private operationId = 0;

  constructor(prerecorded: PrerecordedAudioService, fallback: AudioService) {
    this.prerecorded = prerecorded;
    this.fallback = fallback;
  }

  getState(): AudioPlaybackState {
    return this.active?.getState() ?? 'idle';
  }

  async play(source: AudioSource): Promise<void> {
    const operationId = ++this.operationId;
    await Promise.all([this.prerecorded.stop(), this.fallback.stop()]);

    if (operationId !== this.operationId) {
      return;
    }

    const preferredService = this.prerecorded.has(source) ? this.prerecorded : this.fallback;
    this.active = preferredService;

    try {
      await preferredService.play(source);
    } catch (error) {
      if (preferredService !== this.prerecorded || operationId !== this.operationId) {
        throw error;
      }

      this.active = this.fallback;
      await this.fallback.play(source);
    } finally {
      if (operationId === this.operationId) {
        this.active = null;
      }
    }
  }

  async stop(): Promise<void> {
    this.operationId += 1;
    this.active = null;
    await Promise.all([this.prerecorded.stop(), this.fallback.stop()]);
  }
}
