import { useEffect, useMemo, useState } from 'react';
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
import { DictationPlayer } from '@/features/lessons/dictation-player';
import { canChooseRedo, getRedoWords, parseRedoMode } from '@/features/lessons/lesson-redo';
import { LessonPlayer, type NextLessonLink } from '@/features/lessons/lesson-player';
import { RedoChooser } from '@/features/lessons/redo-chooser';
import { getLessonResumeIndex } from '@/features/progress/progress-state';
import { useLearningProgress } from '@/hooks/use-learning-progress';
import { lessonAudioService } from '@/services/lesson-audio-service';

export default function LessonScreen() {
  const { lessonId, mode: modeParam } = useLocalSearchParams<{ lessonId: string; mode?: string }>();
  const lesson = getLessonById(lessonId);
  const { progress, isLoading, saveError, startLesson, completeActivity, addToReview } =
    useLearningProgress();
  // Whether the lesson was already finished when she opened it. Finishing it
  // now, on its last step, must not turn the screen into the redo choices.
  const [finishedAtOpen, setFinishedAtOpen] = useState<boolean | null>(null);
  if (lesson && !isLoading && finishedAtOpen === null) {
    setFinishedAtOpen(Boolean(progress.lessons[lesson.id]?.completed));
  }
  const wordsLesson = useMemo(
    () => (lesson ? { ...lesson, activities: getRedoWords(lesson) } : undefined),
    [lesson],
  );
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

  // A finished lesson is redone: she picks the word cards, the dictation or all
  // of it (`mode`). Nothing she does in a redo changes the lesson's progress;
  // what she gets wrong goes to "Repetă".
  const finished = finishedAtOpen ?? Boolean(progress.lessons[lesson.id]?.completed);
  const mode = finished ? parseRedoMode(modeParam) : null;

  if (finished && !mode && canChooseRedo(lesson)) {
    return <RedoChooser icon={courseUnit?.icon} lesson={lesson} />;
  }

  if (mode === 'dictation') {
    return (
      <DictationPlayer
        key={`${lesson.id}:dictation`}
        audioService={lessonAudioService}
        lesson={lesson}
        onMissed={(sentence) => addToReview(lesson, sentence.activity)}
      />
    );
  }

  return (
    <LessonPlayer
      key={`${lesson.id}:${mode ?? 'lesson'}`}
      lesson={mode === 'words' && wordsLesson ? wordsLesson : lesson}
      audioService={lessonAudioService}
      initialActivityIndex={finished ? 0 : getLessonResumeIndex(progress, lesson)}
      nextLesson={nextLesson}
      redo={mode === 'words' ? 'words' : finished ? 'all' : undefined}
      saveError={saveError}
      onActivityCompleted={
        mode === 'words'
          ? undefined
          : finished
            ? ({ activity, correct }) => {
                if (correct === false) {
                  addToReview(lesson, activity);
                }
              }
            : ({ activity, response, correct }) => {
                completeActivity({ lesson, activity, response, correct });
              }
      }
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
