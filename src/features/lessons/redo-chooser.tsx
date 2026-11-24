import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { colors, radii, shadows } from '@/constants/theme';
import {
  countRo,
  getDictationSentences,
  getRedoWords,
  wordsMinutes,
  type RedoMode,
} from '@/features/lessons/lesson-redo';
import type { Lesson } from '@/types';

type Choice = {
  mode: RedoMode;
  emoji: string;
  title: string;
  detail: string;
  what: string;
};

/**
 * Opening a finished lesson: she picks what to redo. Only the word cards, the
 * dictation for the workbook, or the whole lesson as the first time. Redoing
 * changes nothing in her progress.
 */
export function RedoChooser({ lesson, icon }: { lesson: Lesson; icon?: string }) {
  const router = useRouter();
  const words = getRedoWords(lesson);
  const sentences = getDictationSentences(lesson);
  const phrasesOnly = words.every((word) => word.isPhrase);
  const choices: Choice[] = [
    {
      mode: 'words',
      emoji: '🔤',
      title: 'Cuvintele',
      detail: `${
        phrasesOnly
          ? countRo(words.length, 'expresie', 'expresii')
          : countRo(words.length, 'cuvânt', 'cuvinte')
      } · cam ${countRo(wordsMinutes(words.length), 'minut', 'minute')}`,
      what: 'Le asculți și le spui din nou.',
    },
    ...(sentences.length > 0
      ? [
          {
            mode: 'dictation' as const,
            emoji: '✍️',
            title: 'Dictare',
            detail: `${countRo(sentences.length, 'propoziție', 'propoziții')} · ia caietul`,
            what: 'Asculți, scrii pe foaie, apoi verifici.',
          },
        ]
      : []),
    {
      mode: 'all',
      emoji: '📚',
      title: 'Toată lecția',
      detail: `${countRo(lesson.activities.length, 'pas', 'pași')} · cam ${countRo(
        lesson.estimatedMinutes,
        'minut',
        'minute',
      )}`,
      what: 'La fel ca prima dată.',
    },
  ];

  return (
    <ScreenContainer
      header={
        <View style={styles.topBar}>
          <Link href="/lessons" asChild>
            <Pressable
              accessibilityLabel="Înapoi la lecții"
              accessibilityRole="button"
              hitSlop={8}
              style={styles.backPressable}>
              {({ pressed }) => (
                <View style={[styles.backButton, pressed && styles.backButtonPressed]}>
                  <Text style={styles.backText}>‹ Înapoi</Text>
                </View>
              )}
            </Pressable>
          </Link>
        </View>
      }>
      <View style={styles.head}>
        {icon ? (
          <View style={styles.icon}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>
        ) : null}
        <View style={styles.headLabels}>
          <Text accessibilityRole="header" style={styles.title}>
            {lesson.title.romanian}
          </Text>
          <Text style={styles.subtitle}>{lesson.title.english}</Text>
        </View>
      </View>
      <Text style={styles.done}>✓ Ai terminat lecția aceasta</Text>

      <Text style={styles.ask}>Ce repeți azi?</Text>
      <View style={styles.choices}>
        {choices.map((choice, index) => (
          <Pressable
            key={choice.mode}
            accessibilityLabel={`${choice.title}: ${choice.detail}. ${choice.what}`}
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: '/lessons/[lessonId]',
                params: { lessonId: lesson.id, mode: choice.mode },
              })
            }
            style={styles.choicePressable}>
            {({ pressed }) => (
              <View
                style={[styles.choice, index === 0 && styles.choiceMain, pressed && styles.pressed]}>
                <Text style={styles.choiceEmoji}>{choice.emoji}</Text>
                <View style={styles.choiceLabels}>
                  <Text style={styles.choiceTitle}>{choice.title}</Text>
                  <Text style={styles.choiceDetail}>{choice.detail}</Text>
                  <Text style={styles.choiceWhat}>{choice.what}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>
      <Text style={styles.calm}>Când repeți, progresul tău rămâne la fel.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
  },
  backPressable: {
    borderRadius: radii.pill,
  },
  backButton: {
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
  },
  backButtonPressed: {
    backgroundColor: colors.primarySoft,
  },
  backText: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 8,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 34,
    lineHeight: 40,
  },
  headLabels: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
  },
  done: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    backgroundColor: colors.successSoft,
    color: colors.success,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 16,
  },
  ask: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 12,
  },
  choices: {
    gap: 12,
  },
  choicePressable: {
    borderRadius: radii.large,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radii.large,
    paddingHorizontal: 16,
    paddingVertical: 16,
    boxShadow: shadows.card,
  },
  choiceMain: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  pressed: {
    backgroundColor: colors.primarySoft,
  },
  choiceEmoji: {
    width: 44,
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'center',
  },
  choiceLabels: {
    flex: 1,
  },
  choiceTitle: {
    color: colors.text,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '800',
  },
  choiceDetail: {
    color: colors.primary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  choiceWhat: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 23,
    marginTop: 4,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '700',
  },
  calm: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 20,
  },
});
