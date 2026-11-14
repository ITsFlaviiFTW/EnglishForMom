import { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { AppButton } from '@/components/app-button';
import { AppCard } from '@/components/app-card';
import { ScreenContainer } from '@/components/screen-container';
import { getCourseUnitByLessonId } from '@/data/courses/course-catalog';
import { getLessonById } from '@/data/lessons/lesson-catalog';
import { getCourseUnitProgression } from '@/features/lessons/course-progression';
import { LessonPlayer } from '@/features/lessons/lesson-player';
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
      <ScreenContainer style={{ justifyContent: 'center', gap: 24 }}>
        <AppCard
          title="Lecția nu a fost găsită"
          description="Întoarce-te la lista de lecții și încearcă din nou."
        />
        <AppButton href="/lessons" title="Înapoi la lecții" />
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer style={{ justifyContent: 'center' }}>
        <AppCard title="Se încarcă progresul…" description="Lecția va începe imediat." />
      </ScreenContainer>
    );
  }

  if (isLocked) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', gap: 24 }}>
        <AppCard
          title="Lecția este blocată"
          description={
            access.lockReason === 'planned'
              ? 'Această lecție este în pregătire.'
              : 'Finalizează lecția anterioară pentru a continua.'
          }
        />
        <AppButton href="/lessons" title="Înapoi la lecții" />
      </ScreenContainer>
    );
  }

  return (
    <LessonPlayer
      lesson={lesson}
      audioService={lessonAudioService}
      initialActivityIndex={getLessonResumeIndex(progress, lesson)}
      saveError={saveError}
      onActivityCompleted={({ activity, response, correct }) => {
        completeActivity({ lesson, activity, response, correct });
      }}
    />
  );
}
