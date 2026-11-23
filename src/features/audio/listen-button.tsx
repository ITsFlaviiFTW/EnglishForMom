import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

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

type Speed = 'listen' | 'words' | 'slow' | 'english';

type AudioControlsProps = {
  /** What is being spoken, used for screen-reader labels. */
  label: string;
  source: AudioSource;
  state: AudioPlaybackState;
  errorMessage: string | null;
  onPlay: (source: AudioSource, options?: AudioPlayOptions) => void;
  /** Stops the sound: the button that is playing shows "Oprește". */
  onStop: () => void;
  size?: 'large' | 'compact';
  /** Shows the Romanian-style spelling above the buttons. Off when the card already shows it. */
  showReadAs?: boolean;
  /** Plays "Ascultă" once by itself when the controls appear (a new card). */
  autoPlay?: boolean;
  /** Placed under the main buttons, above "Ascultă în engleză" (the speaking feedback). */
  children?: ReactNode;
};

/**
 * Two big buttons and a text link. "Ascultă" plays Alina reading the phrase
 * the Romanian way (the English voice when there is no such reading).
 * "Cuvânt cu cuvânt" plays one word at a time and lights up each word; for a
 * single word it is "Mai rar", the same reading slower. "Ascultă în engleză"
 * plays the normal English. While a sound plays, its button turns into
 * "Oprește", so she can stop it in the middle of a sentence.
 */
export function AudioControls({
  label,
  source,
  state,
  errorMessage,
  onPlay,
  onStop,
  size = 'large',
  showReadAs = true,
  autoPlay = false,
  children,
}: AudioControlsProps) {
  const [lastSpeed, setLastSpeed] = useState<Speed | null>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const autoPlayed = useRef(false);
  const accent = getAccentAudio(source);
  const englishWords = getSpacedAudio(source);
  // Word by word in Alina's Romanian-accent reading when there is one, else in English.
  const wordByWord = accent?.spaced
    ? { spaced: accent.spaced, source: toAccentSpacedSource(source) }
    : englishWords
      ? { spaced: englishWords, source: toSpacedSource(source) }
      : null;
  const isBusy = state === 'loading' || state === 'playing';
  const compact = size === 'compact';
  const playing = (speed: Speed) => isBusy && lastSpeed === speed;

  const play = (speed: Speed, playSource: AudioSource, options?: AudioPlayOptions) => {
    setLastSpeed(speed);
    onPlay(playSource, options);
  };
  /** A tap on the button that is playing stops it; otherwise it starts. */
  const toggle = (speed: Speed, start: () => void) => () => (playing(speed) ? onStop() : start());

  const listen = (options?: AudioPlayOptions) =>
    play('listen', accent ? toAccentSource(source) : source, options);
  const playWordByWord = () => {
    if (!wordByWord) {
      return;
    }
    setWordIndex(0);
    play('words', wordByWord.source, {
      onProgress: (seconds) => setWordIndex(findWordIndex(wordByWord.spaced, seconds)),
    });
  };
  const playSlower = () =>
    play('slow', accent ? toAccentSource(source) : source, { playbackRate: SLOW_PLAYBACK_RATE });

  useEffect(() => {
    if (autoPlay && !autoPlayed.current) {
      autoPlayed.current = true;
      listen({ automatic: true });
    }
  });

  return (
    <View style={styles.container}>
      {showReadAs ? <ReadAs source={source} /> : null}
      <View style={styles.row}>
        <PlayButton
          accessibilityLabel={
            accent ? `Ascultă cu accent românesc: ${label}` : `Ascultă în engleză: ${label}`
          }
          compact={compact}
          icon={accent ? '🇷🇴' : '🔊'}
          onPress={toggle('listen', () => listen())}
          playing={playing('listen')}
          title="Ascultă"
          variant="primary"
        />
        {wordByWord ? (
          <PlayButton
            accessibilityLabel={`Ascultă cuvânt cu cuvânt: ${label}`}
            compact={compact}
            icon="🐌"
            onPress={toggle('words', playWordByWord)}
            playing={playing('words')}
            title="Cuvânt cu cuvânt"
            variant="soft"
          />
        ) : (
          <PlayButton
            accessibilityLabel={`Ascultă mai rar: ${label}`}
            compact={compact}
            icon="🐢"
            onPress={toggle('slow', playSlower)}
            playing={playing('slow')}
            title="Mai rar"
            variant="soft"
          />
        )}
      </View>
      {lastSpeed === 'words' && wordByWord ? (
        <WordStrip activeIndex={playing('words') ? wordIndex : null} spaced={wordByWord.spaced} />
      ) : null}

      {children}

      {accent ? (
        <Pressable
          accessibilityLabel={
            playing('english') ? 'Oprește' : `Ascultă în engleză, normal: ${label}`
          }
          accessibilityRole="button"
          hitSlop={8}
          onPress={toggle('english', () => play('english', source))}
          style={styles.linkPressable}>
          {({ pressed }) => (
            <Text style={[styles.link, pressed && styles.linkPressed]}>
              {playing('english') ? '⏹ Oprește' : '🔊 Ascultă în engleză'}
            </Text>
          )}
        </Pressable>
      ) : null}
      {errorMessage ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

/** How to say it, written the Romanian way ("Dă bred iz in di ovăn."). */
export function ReadAs({
  source,
  style,
}: {
  source: AudioSource | undefined;
  style?: StyleProp<ViewStyle>;
}) {
  const accent = source ? getAccentAudio(source) : null;
  if (!accent) {
    return null;
  }

  return (
    <View
      accessibilityLabel={`Se citește: ${accent.respelling}`}
      accessible
      style={[styles.readAs, style]}>
      <Text style={styles.readAsFlag}>🇷🇴</Text>
      <Text style={styles.readAsText}>{accent.respelling}</Text>
    </View>
  );
}

function PlayButton({
  accessibilityLabel,
  playing,
  compact,
  icon,
  onPress,
  title,
  variant,
}: {
  accessibilityLabel: string;
  playing: boolean;
  compact: boolean;
  icon: string;
  onPress: () => void;
  title: string;
  variant: 'primary' | 'soft';
}) {
  const primary = variant === 'primary';

  return (
    <Pressable
      accessibilityLabel={playing ? 'Oprește' : accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      // "Ascultă" keeps its size; the other button takes the rest, so "Cuvânt cu cuvânt" fits on two lines.
      style={primary ? styles.primaryPressable : styles.flexPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.button,
            primary ? styles.primary : styles.soft,
            compact && styles.compact,
            pressed && (primary ? styles.primaryPressed : styles.softPressed),
          ]}>
          <Text style={[styles.icon, compact && styles.iconCompact]}>{playing ? '⏹' : icon}</Text>
          <Text
            numberOfLines={2}
            style={[
              primary ? styles.primaryText : styles.softText,
              compact && styles.textCompact,
            ]}>
            {playing ? 'Oprește' : title}
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
  primaryPressable: {
    flexShrink: 0,
    minWidth: '45%',
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
    paddingHorizontal: 10,
    paddingVertical: 6,
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
  primaryText: {
    flexShrink: 1,
    color: colors.onPrimary,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
    textAlign: 'center',
  },
  softText: {
    flexShrink: 1,
    color: colors.primary,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  compact: {
    minHeight: 56,
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
    lineHeight: 21,
  },
  linkPressable: {
    alignSelf: 'center',
    marginTop: 2,
  },
  link: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
    textDecorationLine: 'underline',
    textDecorationColor: colors.borderStrong,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  linkPressed: {
    color: colors.text,
  },
  readAs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  readAsFlag: {
    fontSize: 20,
    lineHeight: 33,
  },
  readAsText: {
    flexShrink: 1,
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
