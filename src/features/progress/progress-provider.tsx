import { createContext, useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';

import {
  createDefaultProgress,
  recordActivityCompletion,
  recordLessonStarted,
  type ActivityCompletion,
} from '@/features/progress/progress-state';
import { progressRepository } from '@/services/progress-service';
import type { LearnerProgress, LessonId } from '@/types';

type ProgressContextValue = {
  progress: LearnerProgress;
  isLoading: boolean;
  saveError: string | null;
  startLesson: (lessonId: LessonId) => void;
  completeActivity: (completion: Omit<ActivityCompletion, 'completedAt'>) => void;
};

export const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: PropsWithChildren) {
  const progressRef = useRef(createDefaultProgress());
  const [progress, setProgress] = useState(createDefaultProgress);
  const [isLoading, setIsLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void progressRepository.load().then((storedProgress) => {
      if (!active) {
        return;
      }

      progressRef.current = storedProgress;
      setProgress(storedProgress);
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const commit = useCallback((update: (current: LearnerProgress) => LearnerProgress) => {
    const next = update(progressRef.current);
    if (next === progressRef.current) {
      return;
    }

    progressRef.current = next;
    setProgress(next);
    setSaveError(null);
    void progressRepository.save(next).catch(() => {
      setSaveError('Progresul nu a putut fi salvat pe acest dispozitiv.');
    });
  }, []);

  const startLesson = useCallback(
    (lessonId: LessonId) => {
      commit((current) => recordLessonStarted(current, lessonId));
    },
    [commit],
  );

  const completeActivity = useCallback(
    (completion: Omit<ActivityCompletion, 'completedAt'>) => {
      commit((current) =>
        recordActivityCompletion(current, {
          ...completion,
          completedAt: new Date().toISOString(),
        }),
      );
    },
    [commit],
  );

  const value = useMemo(
    () => ({ progress, isLoading, saveError, startLesson, completeActivity }),
    [completeActivity, isLoading, progress, saveError, startLesson],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}
