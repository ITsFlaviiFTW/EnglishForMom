import * as Speech from 'expo-speech';

import { SpeechAudioService, type SpeechEngine } from '@/services/speech-audio-service';

const expoSpeechEngine: SpeechEngine = {
  speak(text, callbacks) {
    Speech.speak(text, callbacks);
  },
  stop() {
    return Speech.stop();
  },
};

export const deviceSpeechService = new SpeechAudioService(expoSpeechEngine);
