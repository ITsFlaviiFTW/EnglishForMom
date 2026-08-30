import { useCallback, useState } from 'react';

import {
  advanceLessonSession,
  canAdvanceLessonSession,
  createLessonSession,
  getCurrentActivity,
  retreatLessonSession,
  selectFillInTheBlankAnswer,
  submitFillInTheBlankAnswer,
  submitSentenceBuildingAnswer,
  submitMultipleChoiceAnswer,
  toggleSentenceBuildingToken,
} from '@/features/lessons/lesson-session';
import type { Lesson } from '@/types';

export function useLessonSession(lesson: Lesson, initialActivityIndex = 0) {
  const [session, setSession] = useState(() => createLessonSession(lesson, initialActivityIndex));

  const answerMultipleChoice = useCallback((optionId: string) => {
    setSession((current) => submitMultipleChoiceAnswer(current, optionId));
  }, []);

  const toggleSentenceToken = useCallback((tokenId: string) => {
    setSession((current) => toggleSentenceBuildingToken(current, tokenId));
  }, []);

  const checkSentenceAnswer = useCallback(() => {
    setSession(submitSentenceBuildingAnswer);
  }, []);

  const selectFillInAnswer = useCallback((answer: string) => {
    setSession((current) => selectFillInTheBlankAnswer(current, answer));
  }, []);

  const checkFillInAnswer = useCallback(() => {
    setSession(submitFillInTheBlankAnswer);
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
    toggleSentenceToken,
    checkSentenceAnswer,
    selectFillInAnswer,
    checkFillInAnswer,
    advance,
    goBack,
  };
}
