import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '@/constants/theme';
import type { AudioPlaybackState, AudioPlayOptions } from '@/services/audio-service';
import {
  getAccentAudio,
  getSpacedAudio,
  toAccentSource,
  toAccentSpacedSource,
  toSpacedSource,
} from '@/services/lesson-audio-service';
import type { AudioSource, SpacedAudio } from '@/types';

export const SLOW_PLAYBACK_RATE = 0.7;

type Speed = 'accent' | 'accent-slow' | 'accent-words' | 'normal' | 'slow' | 'words';

type AudioControlsProps = {
  /** What is being spoken, used for screen-reader labels. */
  label: string;
  source: AudioSource;
  state: AudioPlaybackState;
  errorMessage: string | null;
  onPlay: (source: AudioSource, options?: AudioPlayOptions) => void;
  size?: 'large' | 'compact';
  /** Shows "Se citește: …" above the buttons. Off when the card already shows it. */
  showReadAs?: boolean;
  /** Plays "Ascultă" once by itself when the controls appear (a new card). */
  autoPlay?: boolean;
  /** Placed under the main buttons, above "În engleză" (the speaking feedback). */
  children?: ReactNode;
};

/**
 * Two big buttons and one small one. With a Romanian-accent recording:
 * "Ascultă" plays Alina reading the phrase the Romanian way; "Mai rar" plays
 * her saying one word at a time with each word lit up (or, for a single word,
 * the same reading slower); a small "În engleză" plays the normal English.
 * Without one (the shop dialogues), "Ascultă" and "Mai rar" play the English.
 * Every button stays enabled while audio plays, so a second tap starts again.
 */
export function AudioControls({
  label,
  source,
  state,
  errorMessage,
  onPlay,
  size = 'large',
  showReadAs = true,
  autoPlay = false,
  children,
}: AudioControlsProps) {
  const [lastSpeed, setLastSpeed] = useState<Speed | null>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const autoPlayed = useRef(false);
  const spaced = getSpacedAudio(source);
  const accent = getAccentAudio(source);
  const accentWords = accent?.spaced;
  const isBusy = state === 'loading' || state === 'playing';
  const compact = size === 'compact';
  const busy = (speed: Speed) => isBusy && lastSpeed === speed;

  const play = (speed: Speed, playSource: AudioSource, options?: AudioPlayOptions) => {
    setLastSpeed(speed);
    onPlay(playSource, options);
  };
  const playWords = (speed: 'words' | 'accent-words', words: SpacedAudio, playSource: AudioSource) => {
    setWordIndex(0);
    play(speed, playSource, {
      onProgress: (seconds) => setWordIndex(findWordIndex(words, seconds)),
    });
  };
  const listen = (options?: AudioPlayOptions) =>
    accent ? play('accent', toAccentSource(source), options) : play('normal', source, options);
  const listenSlower = () => {
    if (accentWords) {
      playWords('accent-words', accentWords, toAccentSpacedSource(source));
    } else if (accent) {
      play('accent-slow', toAccentSource(source), { playbackRate: SLOW_PLAYBACK_RATE });
    } else {
      play('slow', source, { playbackRate: SLOW_PLAYBACK_RATE });
    }
  };

  useEffect(() => {
    if (autoPlay && !autoPlayed.current) {
      autoPlayed.current = true;
      listen({ automatic: true });
    }
  });

  const slowerSpeed: Speed = accentWords ? 'accent-words' : accent ? 'accent-slow' : 'slow';
  const strip =
    lastSpeed === 'accent-words' && accentWords ? (
      <WordStrip spaced={accentWords} activeIndex={isBusy ? wordIndex : null} />
    ) : lastSpeed === 'words' && spaced ? (
      <WordStrip spaced={spaced} activeIndex={isBusy ? wordIndex : null} />
    ) : null;

  return (
    <View style={styles.container}>
      {showReadAs ? <ReadAs source={source} /> : null}
      <View style={styles.row}>
        <PlayButton
          accessibilityLabel={
            accent ? `Ascultă cu accent românesc: ${label}` : `Ascultă în engleză: ${label}`
          }
          busy={busy(accent ? 'accent' : 'normal')}
          compact={compact}
          icon={accent ? '🇷🇴' : '🔊'}
          onPress={() => listen()}
          title="Ascultă"
          variant="primary"
        />
        <PlayButton
          accessibilityLabel={
            accentWords
              ? `Ascultă mai rar, cuvânt cu cuvânt, cu accent românesc: ${label}`
              : `Ascultă mai rar: ${label}`
          }
          busy={busy(slowerSpeed)}
          compact={compact}
          icon="🐢"
          onPress={listenSlower}
          title="Mai rar"
          variant="soft"
        />
      </View>
      {!accent && spaced ? (
        <View style={styles.row}>
          <PlayButton
            accessibilityLabel={`Ascultă în engleză, cuvânt cu cuvânt: ${label}`}
            busy={busy('words')}
            compact={compact}
            icon="🐌"
            onPress={() => playWords('words', spaced, toSpacedSource(source))}
            title="Cuvânt cu cuvânt"
            variant="soft"
          />
        </View>
      ) : null}
      {strip}

      {children}

      {accent ? (
        <View style={styles.smallRow}>
          <PlayButton
            accessibilityLabel={`Ascultă în engleză, normal: ${label}`}
            busy={busy('normal')}
            compact
            fill={false}
            icon="🔊"
            onPress={() => play('normal', source)}
            title="În engleză"
            variant="quiet"
          />
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

/** "Se citește: frigi" — how to say it, written the Romanian way. */
export function ReadAs({ source }: { source: AudioSource | undefined }) {
  const accent = source ? getAccentAudio(source) : null;
  if (!accent) {
    return null;
  }

  return (
    <View style={styles.readAs}>
      <Text style={styles.readAsLabel}>🇷🇴 Se citește:</Text>
      <Text style={styles.readAsText}>{accent.respelling}</Text>
    </View>
  );
}

function PlayButton({
  accessibilityLabel,
  busy,
  compact,
  icon,
  onPress,
  title,
  variant,
  fill = true,
}: {
  accessibilityLabel: string;
  busy: boolean;
  compact: boolean;
  icon: string;
  onPress: () => void;
  title: string;
  variant: 'primary' | 'soft' | 'quiet';
  /** Shares the row's width with the other buttons; false keeps it as small as its text. */
  fill?: boolean;
}) {
  const box = {
    primary: [styles.primary, styles.primaryPressed],
    soft: [styles.soft, styles.softPressed],
    quiet: [styles.quiet, styles.quietPressed],
  }[variant];
  const text = { primary: styles.primaryText, soft: styles.softText, quiet: styles.quietText }[
    variant
  ];

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={fill ? styles.flexPressable : null}>
      {({ pressed }) => (
        <View style={[styles.button, box[0], compact && styles.compact, pressed && box[1]]}>
          <Text style={[styles.icon, compact && styles.iconCompact]}>{icon}</Text>
          <Text
            numberOfLines={1}
            style={[text, compact && variant !== 'quiet' && styles.textCompact]}>
            {busy ? (compact ? 'Se aude' : 'Se aude…') : title}
          </Text>
        </View>
      )}
    </Pressable>
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
  smallRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  flexPressable: {
    flex: 1,
  },
  button: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radii.medium,
    paddingHorizontal: 12,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryPressed: {
    backgroundColor: colors.primaryPressed,
  },
  soft: {
    backgroundColor: colors.primarySoft,
  },
  softPressed: {
    backgroundColor: colors.border,
  },
  quiet: {
    minHeight: 48,
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
  },
  quietPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  primaryText: {
    flexShrink: 1,
    color: colors.onPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  softText: {
    flexShrink: 1,
    color: colors.primary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  quietText: {
    flexShrink: 1,
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  compact: {
    minHeight: 52,
    gap: 6,
    paddingHorizontal: 8,
  },
  icon: {
    fontSize: 22,
    lineHeight: 28,
  },
  iconCompact: {
    fontSize: 19,
    lineHeight: 24,
  },
  textCompact: {
    fontSize: 17,
    lineHeight: 22,
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
    fontSize: 26,
    lineHeight: 33,
    fontWeight: '800',
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
