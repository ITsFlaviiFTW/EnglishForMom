import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppCard } from '@/components/app-card';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { colors } from '@/constants/theme';
import { courseOutline } from '@/data/courses/course-outline';
import { kitchenBasicsLesson } from '@/data/lessons/kitchen-basics';
import { useLearningProgress } from '@/hooks/use-learning-progress';

export default function LessonsScreen() {
  const { progress, isLoading } = useLearningProgress();
  const kitchenProgress = progress.lessons[kitchenBasicsLesson.id];
  const lessonStatus = isLoading
    ? 'Se încarcă progresul…'
    : kitchenProgress?.completed
      ? '✓ Lecție finalizată'
      : kitchenProgress
        ? `În progres · pasul ${kitchenProgress.nextActivityIndex + 1} din ${kitchenBasicsLesson.activities.length}`
        : 'Lecție nouă';

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
                <>
                  <Text
                    style={[
                      styles.lessonStatus,
                      kitchenProgress?.completed && styles.completedStatus,
                    ]}>
                    {lessonStatus}
                  </Text>
                  <AppButton
                    href={{
                      pathname: '/lessons/[lessonId]',
                      params: { lessonId: kitchenBasicsLesson.id },
                    }}
                    title="Lesson 1 · Kitchen Basics"
                    subtitle={
                      kitchenProgress?.completed
                        ? 'Vezi lecția finalizată'
                        : kitchenProgress
                          ? 'Continuă lecția'
                          : 'Începe lecția'
                    }
                    variant="primary"
                  />
                </>
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
