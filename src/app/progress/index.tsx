import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/app-card';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { colors, radii } from '@/constants/theme';
import { getCourseLessonIds } from '@/data/courses/course-catalog';
import { summarizeProgress } from '@/features/progress/progress-summary';
import { useLearningProgress } from '@/hooks/use-learning-progress';

export default function ProgressScreen() {
  const { progress, isLoading, saveError } = useLearningProgress();
  const summary = summarizeProgress(progress);
  const totalLessons = getCourseLessonIds().length;
  const answered = progress.correctAnswers + progress.incorrectAnswers;
  const lastPracticed = progress.lastPracticedAt
    ? new Intl.DateTimeFormat('ro-RO', { dateStyle: 'long', timeStyle: 'short' }).format(
        new Date(progress.lastPracticedAt),
      )
    : null;

  const wordLevels = [
    { label: 'Le înveți acum', value: summary.wordsLearning, tone: colors.warm },
    { label: 'Le recunoști', value: summary.wordsFamiliar, tone: colors.primary },
    { label: 'Le știi bine', value: summary.wordsStrong, tone: colors.success },
  ];

  return (
    <ScreenContainer>
      <ScreenHeader title="Progresul meu" description="Tot ce ai învățat până acum." />

      <View style={styles.statGrid}>
        <StatTile
          label={summary.wordsIntroduced === 1 ? 'cuvânt învățat' : 'cuvinte învățate'}
          value={isLoading ? '—' : String(summary.wordsIntroduced)}
        />
        <StatTile
          label={`din ${totalLessons} lecții terminate`}
          value={isLoading ? '—' : String(progress.completedLessonIds.length)}
        />
      </View>

      <AppCard
        style={styles.card}
        title="Cât de bine știi cuvintele"
        description={
          summary.wordsIntroduced === 0
            ? 'Cuvintele apar aici după prima lecție.'
            : 'Cuvintele trec de la „le înveți” la „le știi bine” cu fiecare exercițiu corect.'
        }>
        <View style={styles.levels}>
          {wordLevels.map((level) => (
            <View key={level.label} style={styles.levelRow}>
              <View style={[styles.levelDot, { backgroundColor: level.tone }]} />
              <Text style={styles.levelLabel}>{level.label}</Text>
              <Text style={[styles.levelValue, { color: level.tone }]}>{level.value}</Text>
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.detail}>
          {answered > 0
            ? `Ai răspuns corect la ${progress.correctAnswers} din ${answered} întrebări.`
            : 'Încă nu ai răspuns la întrebări.'}
        </Text>
        <Text style={styles.detailMuted}>
          {lastPracticed ? `Ultima exersare: ${lastPracticed}` : 'Nu ai exersat încă.'}
        </Text>
      </AppCard>

      {saveError ? <Text style={styles.error}>{saveError}</Text> : null}
    </ScreenContainer>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statTile: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radii.large,
    padding: 18,
    gap: 4,
  },
  statValue: {
    color: colors.onPrimary,
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.onPrimaryMuted,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  card: {
    marginTop: 16,
  },
  levels: {
    gap: 4,
  },
  levelRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  levelDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  levelLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    lineHeight: 25,
  },
  levelValue: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  detail: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 27,
  },
  detailMuted: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 6,
  },
  error: {
    color: colors.error,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
  },
});
