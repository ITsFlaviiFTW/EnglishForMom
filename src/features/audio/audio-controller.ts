import type { AudioService } from '@/services/audio-service';
import type { AudioSource } from '@/types';

export class AudioController {
  constructor(private readonly service: AudioService) {}

  play(source: AudioSource) {
    return this.service.play(source);
  }

  stop() {
    return this.service.stop();
  }
}
