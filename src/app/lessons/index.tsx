import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppCard } from '@/components/app-card';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { colors } from '@/constants/theme';
import { getCourseById } from '@/data/courses/course-catalog';
import { courseOutline } from '@/data/courses/course-outline';
import { getLessonById } from '@/data/lessons/lesson-catalog';
import { useLearningProgress } from '@/hooks/use-learning-progress';

const homeLessonEntries =
  getCourseById('my-home')?.units.flatMap((unit) =>
    unit.lessonIds.flatMap((lessonId) => {
      const lesson = getLessonById(lessonId);
      return lesson ? [{ lesson, topicRomanian: unit.title.romanian }] : [];
    }),
  ) ?? [];

export default function LessonsScreen() {
  const { progress, isLoading } = useLearningProgress();

  return (
    <ScreenContainer style={styles.screen}>
      <ScreenHeader
        title="Lecții"
        description="Începem cu engleza pe care o folosești acasă, apoi continuăm treptat."
      />

      <View style={styles.list}>
        {courseOutline.map((courseLevel) => (
          <AppCard
            key={courseLevel.id}
            eyebrow={`${courseLevel.level}${courseLevel.available ? ' · Disponibil' : ' · Planificat'}`}
            title={courseLevel.title}
            description={courseLevel.description}>
            <View style={styles.cardContent}>
              <Text style={styles.topics}>{courseLevel.topics.join('  •  ')}</Text>
              {courseLevel.available ? (
                <View style={styles.lessonList}>
                  {homeLessonEntries.map(({ lesson, topicRomanian }, index) => {
                    const lessonProgress = progress.lessons[lesson.id];
                    const lessonStatus = isLoading
                      ? 'Se încarcă progresul…'
                      : lessonProgress?.completed
                        ? '✓ Lecție finalizată'
                        : lessonProgress
                          ? `În progres · pasul ${lessonProgress.nextActivityIndex + 1} din ${lesson.activities.length}`
                          : 'Lecție nouă';

                    return (
                      <View
                        key={lesson.id}
                        style={[styles.lessonEntry, index > 0 && styles.lessonEntrySeparated]}>
                        <Text
                          style={[
                            styles.lessonStatus,
                            lessonProgress?.completed && styles.completedStatus,
                          ]}>
                          {lessonStatus}
                        </Text>
                        <AppButton
                          href={{
                            pathname: '/lessons/[lessonId]',
                            params: { lessonId: lesson.id },
                          }}
                          title={`Lecția ${index + 1} · ${topicRomanian}`}
                          subtitle={
                            lessonProgress?.completed
                              ? 'Vezi lecția finalizată'
                              : lessonProgress
                                ? 'Continuă lecția'
                                : 'Începe lecția'
                          }
                          variant="primary"
                        />
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </View>
          </AppCard>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 36,
  },
  list: {
    gap: 16,
  },
  topics: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 25,
  },
  cardContent: {
    gap: 18,
  },
  lessonList: {
    gap: 18,
  },
  lessonEntry: {
    gap: 10,
  },
  lessonEntrySeparated: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 18,
  },
  lessonStatus: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
  },
  completedStatus: {
    color: colors.success,
  },
});
