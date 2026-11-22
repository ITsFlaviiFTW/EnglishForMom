import { useState, type ReactNode } from 'react';
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

type Speed = 'accent' | 'accent-slow' | 'normal' | 'slow' | 'words';

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
  /** Placed under the main buttons, above the normal English (the speaking check). */
  children?: ReactNode;
};

/**
 * When a Romanian-accent recording exists, it is the main way to listen:
 * "Ascultă" plays Alina reading the phrase the Romanian way and "Mai rar"
 * plays the same reading slower. The normal English ("În engleză", and
 * "Cuvânt cu cuvânt" for phrases) sits below.
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
  children,
}: AudioControlsProps) {
  const [lastSpeed, setLastSpeed] = useState<Speed | null>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const spaced = getSpacedAudio(source);
  const accent = getAccentAudio(source);
  const isBusy = state === 'loading' || state === 'playing';
  const compact = size === 'compact';
  const busy = (speed: Speed) => isBusy && lastSpeed === speed;

  const play = (speed: Speed, playSource: AudioSource, options?: AudioPlayOptions) => {
    setLastSpeed(speed);
    onPlay(playSource, options);
  };
  const playWords = () => {
    if (!spaced) {
      return;
    }
    setWordIndex(0);
    play('words', toSpacedSource(source), {
      onProgress: (seconds) => setWordIndex(findWordIndex(spaced, seconds)),
    });
  };

  const wordsButton = spaced ? (
    <PlayButton
      accessibilityLabel={`Ascultă în engleză, cuvânt cu cuvânt: ${label}`}
      busy={busy('words')}
      compact={compact}
      icon="🐌"
      onPress={playWords}
      title="Cuvânt cu cuvânt"
      variant={accent ? 'quiet' : 'soft'}
      wraps
    />
  ) : null;
  const wordStrip =
    spaced && lastSpeed === 'words' ? (
      <WordStrip spaced={spaced} activeIndex={isBusy ? wordIndex : null} />
    ) : null;
  const error = errorMessage ? (
    <Text accessibilityLiveRegion="polite" style={styles.error}>
      {errorMessage}
    </Text>
  ) : null;

  if (!accent) {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <PlayButton
            accessibilityLabel={`Ascultă în engleză: ${label}`}
            busy={busy('normal')}
            compact={compact}
            icon="🔊"
            onPress={() => play('normal', source)}
            title="Ascultă"
            variant="primary"
          />
          <PlayButton
            accessibilityLabel={`Ascultă mai rar: ${label}`}
            busy={busy('slow')}
            compact={compact}
            icon="🐢"
            onPress={() => play('slow', source, { playbackRate: SLOW_PLAYBACK_RATE })}
            title="Mai rar"
            variant="soft"
          />
        </View>
        {wordsButton ? <View style={styles.row}>{wordsButton}</View> : null}
        {wordStrip}
        {children}
        {error}
      </View>
    );
  }

  const accentSource = toAccentSource(source);
  return (
    <View style={styles.container}>
      {showReadAs ? <ReadAs source={source} /> : null}
      <View style={styles.row}>
        <PlayButton
          accessibilityLabel={`Ascultă cu accent românesc: ${label}`}
          busy={busy('accent')}
          compact={compact}
          icon="🇷🇴"
          onPress={() => play('accent', accentSource)}
          title="Ascultă"
          variant="primary"
        />
        <PlayButton
          accessibilityLabel={`Ascultă mai rar, cu accent românesc: ${label}`}
          busy={busy('accent-slow')}
          compact={compact}
          icon="🐢"
          onPress={() => play('accent-slow', accentSource, { playbackRate: SLOW_PLAYBACK_RATE })}
          title="Mai rar"
          variant="soft"
        />
      </View>

      {children}

      <View style={styles.englishSection}>
        <Text style={styles.englishLabel}>Pronunția normală, în engleză:</Text>
        <View style={styles.row}>
          <PlayButton
            accessibilityLabel={`Ascultă în engleză, normal: ${label}`}
            busy={busy('normal')}
            compact
            icon="🔊"
            onPress={() => play('normal', source)}
            title="În engleză"
            variant="quiet"
          />
          {wordsButton}
        </View>
        {wordStrip}
      </View>
      {error}
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
  wraps = false,
}: {
  accessibilityLabel: string;
  busy: boolean;
  compact: boolean;
  icon: string;
  onPress: () => void;
  title: string;
  variant: 'primary' | 'soft' | 'quiet';
  /** Lets a long title use two lines instead of being cut off. */
  wraps?: boolean;
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
      style={styles.flexPressable}>
      {({ pressed }) => (
        <View style={[styles.button, box[0], compact && styles.compact, pressed && box[1]]}>
          <Text style={[styles.icon, compact && styles.iconCompact]}>{icon}</Text>
          <Text
            numberOfLines={wraps ? 2 : 1}
            style={[
              text,
              compact && variant !== 'quiet' && styles.textCompact,
              wraps && styles.textWraps,
            ]}>
            {busy ? 'Se aude…' : title}
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
  textWraps: {
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
  englishSection: {
    gap: 8,
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  englishLabel: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
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
