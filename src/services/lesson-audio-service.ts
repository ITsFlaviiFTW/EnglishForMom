import { generatedAudioAssets } from '@/data/audio/generated-audio-assets';
import { deviceSpeechService } from '@/services/expo-speech-service';
import { FallbackAudioService } from '@/services/fallback-audio-service';
import { PrerecordedAudioService } from '@/services/prerecorded-audio-service';

const prerecordedAudioService = new PrerecordedAudioService(generatedAudioAssets);

export const lessonAudioService = new FallbackAudioService(
  prerecordedAudioService,
  deviceSpeechService,
);
