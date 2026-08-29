import { useCallback, useState } from 'react';

import {
  advanceLessonSession,
  canAdvanceLessonSession,
  createLessonSession,
  getCurrentActivity,
  retreatLessonSession,
  submitMultipleChoiceAnswer,
} from '@/features/lessons/lesson-session';
import type { Lesson } from '@/types';

export function useLessonSession(lesson: Lesson) {
  const [session, setSession] = useState(() => createLessonSession(lesson));

  const answerMultipleChoice = useCallback((optionId: string) => {
    setSession((current) => submitMultipleChoiceAnswer(current, optionId));
  }, []);

  const advance = useCallback(() => {
    setSession(advanceLessonSession);
  }, []);

  const goBack = useCallback(() => {
    setSession(retreatLessonSession);
  }, []);

  return {
    session,
    currentActivity: getCurrentActivity(session),
    canContinue: canAdvanceLessonSession(session),
    answerMultipleChoice,
    advance,
    goBack,
  };
}
