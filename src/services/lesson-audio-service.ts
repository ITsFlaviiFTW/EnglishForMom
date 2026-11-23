import { Platform } from 'react-native';

import { accentAudioAssets } from '@/data/audio/accent-audio-assets';
import { generatedAudioAssets } from '@/data/audio/generated-audio-assets';
import { spacedAudioAssets } from '@/data/audio/spaced-audio-assets';
import { deviceSpeechService } from '@/services/expo-speech-service';
import { FallbackAudioService } from '@/services/fallback-audio-service';
import type { RecordedAudioService } from '@/services/audio-service';
import { PrerecordedAudioService } from '@/services/prerecorded-audio-service';
import { WebAudioService } from '@/services/web-audio-service';
import type { AccentAudio, AudioSource, SpacedAudio } from '@/types';

const SPACED_SUFFIX = '--spaced';
const ACCENT_SUFFIX = '--accent';
const ACCENT_SPACED_SUFFIX = '--accent-spaced';

const recordings: Readonly<Record<string, number>> = {
  ...generatedAudioAssets,
  ...Object.fromEntries(
    Object.entries(spacedAudioAssets).map(([key, spaced]) => [`${key}${SPACED_SUFFIX}`, spaced.asset]),
  ),
  ...Object.fromEntries(
    Object.entries(accentAudioAssets).map(([key, accent]) => [`${key}${ACCENT_SUFFIX}`, accent.asset]),
  ),
  ...Object.fromEntries(
    Object.entries(accentAudioAssets).flatMap(([key, accent]) =>
      accent.spaced ? [[`${key}${ACCENT_SPACED_SUFFIX}`, accent.spaced.asset]] : [],
    ),
  ),
};

const webAudioService = Platform.OS === 'web' ? new WebAudioService(recordings) : null;
const prerecordedAudioService: RecordedAudioService =
  webAudioService ?? new PrerecordedAudioService(recordings);

/**
 * On the web, lets the first tap anywhere in the app (the home screen's
 * "Începe", say) unlock sound, so a lesson's first card can play by itself.
 * Called once when the app opens; returns a function that stops listening.
 */
export function unlockAudioOnFirstTap(): () => void {
  return webAudioService?.listenForFirstTap(document) ?? (() => {});
}

export const lessonAudioService = new FallbackAudioService(
  prerecordedAudioService,
  deviceSpeechService,
);

/** The word-by-word recording for a phrase, if one was generated. */
export function getSpacedAudio(source: AudioSource): SpacedAudio | undefined {
  return spacedAudioAssets[source.key];
}

/** An audio source that plays the word-by-word recording of `source`. */
export function toSpacedSource(source: AudioSource): AudioSource {
  return { ...source, key: `${source.key}${SPACED_SUFFIX}` };
}

/** The Romanian-accent recording for a phrase, if one was generated. */
export function getAccentAudio(source: AudioSource): AccentAudio | undefined {
  return accentAudioAssets[source.key];
}

/** An audio source that plays the Romanian-accent recording of `source`. */
export function toAccentSource(source: AudioSource): AudioSource {
  return { ...source, key: `${source.key}${ACCENT_SUFFIX}` };
}

/** An audio source that plays the Romanian-accent recording of `source` word by word. */
export function toAccentSpacedSource(source: AudioSource): AudioSource {
  return { ...source, key: `${source.key}${ACCENT_SPACED_SUFFIX}` };
}
