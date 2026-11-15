import { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppCard } from '@/components/app-card';
import { ScreenContainer } from '@/components/screen-container';
import { getCourses, getCourseUnitByLessonId } from '@/data/courses/course-catalog';
import { getLessonById } from '@/data/lessons/lesson-catalog';
import {
  getCourseUnitProgression,
  getUnlockedCourseLessonIds,
} from '@/features/lessons/course-progression';
import { LessonPlayer, type NextLessonLink } from '@/features/lessons/lesson-player';
import { getLessonResumeIndex } from '@/features/progress/progress-state';
import { useLearningProgress } from '@/hooks/use-learning-progress';
import { lessonAudioService } from '@/services/lesson-audio-service';

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const lesson = getLessonById(lessonId);
  const { progress, isLoading, saveError, startLesson, completeActivity } = useLearningProgress();
  const courseUnit = lesson ? getCourseUnitByLessonId(lesson.id) : undefined;
  const access = courseUnit
    ? getCourseUnitProgression(courseUnit, progress.completedLessonIds)
    : undefined;
  const isLocked = access?.status === 'locked';

  useEffect(() => {
    if (lesson && !isLoading && !isLocked && !progress.lessons[lesson.id]?.completed) {
      startLesson(lesson.id);
    }
  }, [isLoading, isLocked, lesson, progress.lessons, startLesson]);

  if (!lesson) {
    return (
      <ScreenContainer style={styles.centered}>
        <AppCard
          title="Lecția nu a fost găsită"
          description="Întoarce-te la lista de lecții și încearcă din nou."
        />
        <AppButton href="/lessons" icon="📚" title="Înapoi la lecții" />
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <AppCard title="Se pregătește lecția…" description="Durează doar o clipă." />
      </ScreenContainer>
    );
  }

  if (isLocked) {
    return (
      <ScreenContainer style={styles.centered}>
        <AppCard
          eyebrow="🔒 Încă nu"
          title={
            access.lockReason === 'planned'
              ? 'Lecția aceasta este în pregătire.'
              : 'Lecția se deschide după cea dinainte.'
          }
          description="Mergi pas cu pas. Termină lecția anterioară și aceasta se va deschide singură."
        />
        <AppButton href="/lessons" icon="📚" title="Înapoi la lecții" />
      </ScreenContainer>
    );
  }

  const unlockedLessonIds = getUnlockedCourseLessonIds(
    getCourses(),
    progress.completedLessonIds,
  );
  const nextLessonId = unlockedLessonIds.find(
    (candidate) => candidate !== lesson.id && !progress.completedLessonIds.includes(candidate),
  );
  const nextLessonData = nextLessonId ? getLessonById(nextLessonId) : undefined;
  const nextLesson: NextLessonLink | null = nextLessonData
    ? {
        id: nextLessonData.id,
        title: nextLessonData.title.romanian,
        icon: getCourseUnitByLessonId(nextLessonData.id)?.icon,
      }
    : null;

  return (
    <LessonPlayer
      key={lesson.id}
      lesson={lesson}
      audioService={lessonAudioService}
      initialActivityIndex={
        // A finished lesson opens from the start so it can be practised again.
        progress.lessons[lesson.id]?.completed ? 0 : getLessonResumeIndex(progress, lesson)
      }
      nextLesson={nextLesson}
      saveError={saveError}
      onActivityCompleted={({ activity, response, correct }) => {
        completeActivity({ lesson, activity, response, correct });
      }}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 32,
  },
});
