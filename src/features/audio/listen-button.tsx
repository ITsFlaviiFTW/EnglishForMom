import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '@/constants/theme';
import type { AudioPlaybackState, AudioPlayOptions } from '@/services/audio-service';
import {
  getAccentAudio,
  getSpacedAudio,
  toAccentSource,
  toSpacedSource,
} from '@/services/lesson-audio-service';
import type { AudioSource, SpacedAudio } from '@/types';

export const SLOW_PLAYBACK_RATE = 0.7;

type Speed = 'normal' | 'slow' | 'words' | 'accent';

type AudioControlsProps = {
  /** What is being spoken, used for screen-reader labels. */
  label: string;
  source: AudioSource;
  state: AudioPlaybackState;
  errorMessage: string | null;
  onPlay: (source: AudioSource, options?: AudioPlayOptions) => void;
  size?: 'large' | 'compact';
};

/**
 * "Ascultă" (normal), "Mai rar" (slower), for phrases "Cuvânt cu cuvânt"
 * (each word alone, with a pause, highlighted as it is spoken) and "Cu accent
 * românesc" (a Romanian voice reads it the Romanian way, then the normal
 * English plays). Every button stays enabled while audio plays, so a second tap
 * starts again.
 */
export function AudioControls({
  label,
  source,
  state,
  errorMessage,
  onPlay,
  size = 'large',
}: AudioControlsProps) {
  const [lastSpeed, setLastSpeed] = useState<Speed>('normal');
  const [wordIndex, setWordIndex] = useState(0);
  const spaced = getSpacedAudio(source);
  const accent = getAccentAudio(source);
  const isBusy = state === 'loading' || state === 'playing';
  const compact = size === 'compact';
  const busyLabel = (speed: Speed, idle: string) =>
    isBusy && lastSpeed === speed ? 'Se aude…' : idle;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          accessibilityLabel={`Ascultă în engleză: ${label}`}
          accessibilityRole="button"
          onPress={() => {
            setLastSpeed('normal');
            onPlay(source);
          }}
          style={styles.flexPressable}>
          {({ pressed }) => (
            <View style={[styles.listen, compact && styles.compact, pressed && styles.listenPressed]}>
              <Text style={[styles.icon, compact && styles.iconCompact]}>🔊</Text>
              <Text numberOfLines={1} style={[styles.listenText, compact && styles.textCompact]}>
                {busyLabel('normal', 'Ascultă')}
              </Text>
            </View>
          )}
        </Pressable>
        <Pressable
          accessibilityLabel={`Ascultă mai rar: ${label}`}
          accessibilityRole="button"
          onPress={() => {
            setLastSpeed('slow');
            onPlay(source, { playbackRate: SLOW_PLAYBACK_RATE });
          }}
          style={styles.flexPressable}>
          {({ pressed }) => (
            <View style={[styles.soft, compact && styles.compact, pressed && styles.softPressed]}>
              <Text style={[styles.icon, compact && styles.iconCompact]}>🐢</Text>
              <Text numberOfLines={1} style={[styles.softText, compact && styles.textCompact]}>
                {busyLabel('slow', 'Mai rar')}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {spaced ? (
        <Pressable
          accessibilityLabel={`Ascultă cuvânt cu cuvânt: ${label}`}
          accessibilityRole="button"
          onPress={() => {
            setLastSpeed('words');
            setWordIndex(0);
            onPlay(toSpacedSource(source), {
              onProgress: (seconds) => setWordIndex(findWordIndex(spaced, seconds)),
            });
          }}>
          {({ pressed }) => (
            <View style={[styles.soft, compact && styles.compact, pressed && styles.softPressed]}>
              <Text style={[styles.icon, compact && styles.iconCompact]}>🐌</Text>
              <Text numberOfLines={1} style={[styles.softText, compact && styles.textCompact]}>
                {busyLabel('words', 'Cuvânt cu cuvânt')}
              </Text>
            </View>
          )}
        </Pressable>
      ) : null}

      {spaced && lastSpeed === 'words' ? (
        <WordStrip spaced={spaced} activeIndex={isBusy ? wordIndex : null} />
      ) : null}

      {accent ? (
        <Pressable
          accessibilityLabel={`Ascultă cu accent românesc, apoi în engleză: ${label}`}
          accessibilityRole="button"
          onPress={() => {
            setLastSpeed('accent');
            onPlay(toAccentSource(source));
          }}>
          {({ pressed }) => (
            <View style={[styles.accent, compact && styles.compact, pressed && styles.accentPressed]}>
              <Text style={[styles.icon, compact && styles.iconCompact]}>🇷🇴</Text>
              <Text numberOfLines={1} style={[styles.accentText, compact && styles.textCompact]}>
                {busyLabel('accent', 'Cu accent românesc')}
              </Text>
            </View>
          )}
        </Pressable>
      ) : null}

      {accent && lastSpeed === 'accent' ? (
        <View accessibilityLiveRegion="polite" style={styles.readAs}>
          <Text style={styles.readAsLabel}>Se citește:</Text>
          <Text style={styles.readAsText}>{accent.respelling}</Text>
          <Text style={styles.readAsNote}>Apoi se aude în engleză, normal.</Text>
        </View>
      ) : null}

      {errorMessage ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

/** The phrase in large words; the word being spoken is highlighted. */
function WordStrip({ spaced, activeIndex }: { spaced: SpacedAudio; activeIndex: number | null }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.strip}>
      {spaced.words.map((word, index) => {
        const isActive = activeIndex === index;
        const isUpcoming = activeIndex !== null && index > activeIndex;
        return (
          <View key={`${word}-${index}`} style={[styles.word, isActive && styles.wordActive]}>
            <Text
              style={[
                styles.wordText,
                isActive && styles.wordTextActive,
                isUpcoming && styles.wordTextUpcoming,
              ]}>
              {word}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function findWordIndex(spaced: SpacedAudio, seconds: number): number {
  let index = 0;
  for (let i = 0; i < spaced.starts.length; i += 1) {
    // Light the word up a moment before it starts, so it never lags behind the voice.
    if (spaced.starts[i] <= seconds + 0.1) {
      index = i;
    }
  }
  return index;
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flexPressable: {
    flex: 1,
  },
  listen: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: radii.medium,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
  },
  listenPressed: {
    backgroundColor: colors.primaryPressed,
  },
  soft: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radii.medium,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
  },
  softPressed: {
    backgroundColor: colors.border,
  },
  accent: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radii.medium,
    backgroundColor: colors.warmSoft,
    paddingHorizontal: 12,
  },
  accentPressed: {
    backgroundColor: colors.border,
  },
  accentText: {
    color: colors.warm,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  readAs: {
    gap: 2,
    backgroundColor: colors.warmSoft,
    borderRadius: radii.medium,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  readAsLabel: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  readAsText: {
    color: colors.warm,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '800',
  },
  readAsNote: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 20,
  },
  compact: {
    minHeight: 52,
  },
  icon: {
    fontSize: 22,
    lineHeight: 28,
  },
  iconCompact: {
    fontSize: 19,
    lineHeight: 24,
  },
  listenText: {
    color: colors.onPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  softText: {
    color: colors.primary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  textCompact: {
    fontSize: 17,
    lineHeight: 22,
  },
  strip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    backgroundColor: colors.background,
    borderRadius: radii.medium,
    padding: 10,
  },
  word: {
    borderRadius: radii.small,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  wordActive: {
    backgroundColor: colors.primary,
  },
  wordText: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  wordTextActive: {
    color: colors.onPrimary,
  },
  wordTextUpcoming: {
    color: colors.textMuted,
    opacity: 0.55,
  },
  error: {
    color: colors.error,
    fontSize: 16,
    lineHeight: 23,
  },
});
