import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/app-card';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { colors } from '@/constants/theme';
import { summarizeProgress } from '@/features/progress/progress-summary';
import { useLearningProgress } from '@/hooks/use-learning-progress';

export default function ProgressScreen() {
  const { progress, isLoading, saveError } = useLearningProgress();
  const summary = summarizeProgress(progress);
  const progressItems = [
    { label: 'Lecții finalizate', value: summary.completedLessons },
    { label: 'Cuvinte exersate', value: summary.practicedVocabulary },
    { label: 'Răspunsuri corecte', value: summary.correctAnswers },
    { label: 'Răspunsuri greșite', value: summary.incorrectAnswers },
    { label: 'Zile de studiu', value: summary.studyDays },
  ];
  const lastPracticed = progress.lastPracticedAt
    ? new Intl.DateTimeFormat('ro-RO', { dateStyle: 'long', timeStyle: 'short' }).format(
        new Date(progress.lastPracticedAt),
      )
    : null;

  return (
    <ScreenContainer style={styles.screen}>
      <ScreenHeader
        title="Progres"
        description="Rezultatele tale vor fi salvate pe acest dispozitiv."
      />

      <AppCard
        title={isLoading ? 'Se încarcă progresul…' : 'Rezumatul tău'}
        description={
          lastPracticed
            ? `Ultima exersare: ${lastPracticed}`
            : 'Progresul va apărea după prima activitate.'
        }>
        <View style={styles.summary}>
          {progressItems.map((item) => (
            <View key={item.label} style={styles.summaryRow}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{String(item.value)}</Text>
            </View>
          ))}
        </View>
      </AppCard>
      {saveError ? <Text style={styles.error}>{saveError}</Text> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 36,
  },
  summary: {
    gap: 14,
  },
  summaryRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  label: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 24,
  },
  value: {
    color: colors.primary,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  error: {
    color: colors.error,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
  },
});
