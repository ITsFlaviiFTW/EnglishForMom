import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { InstallHint } from '@/components/install-hint';
import { ProgressBar } from '@/components/progress-bar';
import { ScreenContainer } from '@/components/screen-container';
import { colors, radii, shadows } from '@/constants/theme';
import { getCourseLessonIds, getCourses, getCourseUnitByLessonId } from '@/data/courses/course-catalog';
import { getLessonById } from '@/data/lessons/lesson-catalog';
import { getUnlockedCourseLessonIds } from '@/features/lessons/course-progression';
import { selectContinueLessonId } from '@/features/progress/progress-state';
import { summarizeProgress } from '@/features/progress/progress-summary';
import { getDueReviewCount } from '@/features/review/review-queue';
import { useLearningProgress } from '@/hooks/use-learning-progress';

export default function HomeScreen() {
  const { progress, isLoading } = useLearningProgress();
  const unlockedLessonIds = getUnlockedCourseLessonIds(getCourses(), progress.completedLessonIds);
  const continueLessonId = selectContinueLessonId(unlockedLessonIds, progress);
  const continueLesson = continueLessonId ? getLessonById(continueLessonId) : undefined;
  const continueIcon = continueLessonId ? getCourseUnitByLessonId(continueLessonId)?.icon : undefined;
  const lessonProgress = continueLesson ? progress.lessons[continueLesson.id] : undefined;
  const inProgress = Boolean(lessonProgress && !lessonProgress.completed);
  const dueReviewCount = getDueReviewCount(progress.reviewItems);
  const summary = summarizeProgress(progress);
  const totalLessons = getCourseLessonIds().length;
  const completedLessons = progress.completedLessonIds.length;
  const isFirstVisit = !isLoading && Object.keys(progress.lessons).length === 0;

  // One button decides: a lesson she started goes on; otherwise, words she
  // found hard come back first ("Repetă"), and the review leads into the lesson.
  const reviewFirst = !isLoading && !inProgress && dueReviewCount > 0;
  const continueHref = continueLessonId
    ? reviewFirst
      ? ({ pathname: '/review', params: { next: continueLessonId } } as const)
      : ({ pathname: '/lessons/[lessonId]', params: { lessonId: continueLessonId } } as const)
    : reviewFirst
      ? ('/review' as const)
      : ('/lessons' as const);
  const continueLabel = isLoading
    ? 'Se încarcă…'
    : !continueLesson
      ? 'Ai terminat toate lecțiile!'
      : isFirstVisit
        ? 'Începe prima lecție'
        : inProgress
          ? 'Continuă lecția'
          : 'Lecția următoare';

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.brandRow}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>P</Text>
        </View>
        <Text style={styles.brand}>Prava</Text>
      </View>

      <Text accessibilityRole="header" style={styles.greeting}>
        Bună!
      </Text>
      <Text style={styles.intro}>
        {isFirstVisit
          ? 'Învățăm engleza de zi cu zi, pas cu pas. Câteva minute pe zi sunt de ajuns.'
          : 'Câteva minute azi te duc mai departe.'}
      </Text>

      <Link href={continueHref} asChild>
        <Pressable
          accessibilityLabel={`${continueLabel}: ${continueLesson?.title.romanian ?? 'lecții'}`}
          accessibilityRole="link"
          style={styles.heroPressable}>
          {({ pressed }) => (
            <View style={[styles.hero, pressed && styles.heroPressed]}>
              <Text style={styles.heroEyebrow}>{continueLabel.toUpperCase()}</Text>
              <View style={styles.heroLessonRow}>
                {continueIcon ? (
                  <View style={styles.heroIcon}>
                    <Text style={styles.heroIconText}>{continueIcon}</Text>
                  </View>
                ) : null}
                <View style={styles.heroLabels}>
                  <Text style={styles.heroTitle}>
                    {continueLesson?.title.romanian ?? 'Vezi toate lecțiile'}
                  </Text>
                  {continueLesson ? (
                    <Text style={styles.heroSubtitle}>
                      {continueLesson.title.english} · {continueLesson.estimatedMinutes} min
                    </Text>
                  ) : null}
                </View>
              </View>
              {reviewFirst ? (
                <Text style={styles.heroReview}>
                  🔁 Întâi repeți {dueReviewCount === 1 ? 'un cuvânt' : `${dueReviewCount} cuvinte`}
                  {continueLesson ? ', apoi începe lecția.' : '.'}
                </Text>
              ) : null}
              {continueLesson && inProgress && lessonProgress ? (
                <View style={styles.heroProgress}>
                  <ProgressBar
                    accessibilityLabel={`Pasul ${lessonProgress.nextActivityIndex + 1} din ${continueLesson.activities.length}`}
                    max={continueLesson.activities.length}
                    tone="onPrimary"
                    value={lessonProgress.nextActivityIndex}
                  />
                  <Text style={styles.heroProgressText}>
                    Pasul {lessonProgress.nextActivityIndex + 1} din {continueLesson.activities.length}
                  </Text>
                </View>
              ) : null}
              <View style={styles.heroButton}>
                <Text style={styles.heroButtonText}>
                  {inProgress ? 'Continuă  ›' : 'Începe  ›'}
                </Text>
              </View>
            </View>
          )}
        </Pressable>
      </Link>

      <InstallHint />

      <View style={styles.menu}>
        <AppButton
          href="/lessons"
          icon="📚"
          title="Toate lecțiile"
          subtitle={`${completedLessons} din ${totalLessons} terminate`}
        />
        <AppButton
          href="/progress"
          icon="📈"
          title="Progresul meu"
          subtitle={
            summary.wordsIntroduced === 1
              ? '1 cuvânt învățat'
              : summary.wordsIntroduced > 1
                ? `${summary.wordsIntroduced} cuvinte învățate`
                : 'Vezi cât ai învățat'
          }
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.onPrimary,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '800',
  },
  brand: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  greeting: {
    color: colors.text,
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  intro: {
    color: colors.textMuted,
    fontSize: 20,
    lineHeight: 29,
    marginTop: 6,
    marginBottom: 24,
  },
  heroPressable: {
    borderRadius: 26,
  },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 26,
    padding: 22,
    gap: 16,
    boxShadow: shadows.raised,
  },
  heroPressed: {
    backgroundColor: colors.primaryPressed,
  },
  heroEyebrow: {
    color: colors.onPrimaryMuted,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroLessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconText: {
    fontSize: 34,
    lineHeight: 40,
  },
  heroLabels: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    color: colors.onPrimary,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: colors.onPrimaryMuted,
    fontSize: 17,
    lineHeight: 23,
  },
  heroProgress: {
    gap: 8,
  },
  heroProgressText: {
    color: colors.onPrimaryMuted,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  heroReview: {
    color: colors.onPrimary,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '700',
    marginTop: 14,
  },
  heroButton: {
    minHeight: 58,
    borderRadius: radii.medium,
    backgroundColor: colors.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroButtonText: {
    color: colors.primary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
  },
  menu: {
    gap: 12,
    marginTop: 24,
  },
});
