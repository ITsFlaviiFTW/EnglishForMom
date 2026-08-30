import type {
  ActivityId,
  ActivityResponse,
  FillInTheBlankActivity,
  Lesson,
  LessonActivity,
  MultipleChoiceActivity,
} from '@/types';
import { isFillInAnswerCorrect } from './fill-in-the-blank.ts';
import {
  buildSentenceFromTokenOrder,
  isSentenceBuildingAnswerCorrect,
} from './sentence-building.ts';

export type LessonSessionStatus = 'in-progress' | 'completed';

export type LessonSession = {
  lesson: Lesson;
  currentActivityIndex: number;
  responses: Readonly<Partial<Record<ActivityId, ActivityResponse>>>;
  feedback: AnswerFeedback | null;
  status: LessonSessionStatus;
};

export type MultipleChoiceAnswerFeedback = {
  type: 'multiple-choice';
  activityId: ActivityId;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
};

export type SentenceBuildingAnswerFeedback = {
  type: 'sentence-building';
  activityId: ActivityId;
  selectedTokenIds: readonly string[];
  selectedSentence: string;
  correctSentence: string;
  isCorrect: boolean;
};

export type FillInTheBlankAnswerFeedback = {
  type: 'fill-in-the-blank';
  activityId: ActivityId;
  selectedAnswer: string;
  correctAnswer: string;
  correctSentence: string;
  isCorrect: boolean;
};

export type AnswerFeedback =
  | MultipleChoiceAnswerFeedback
  | SentenceBuildingAnswerFeedback
  | FillInTheBlankAnswerFeedback;

export function createLessonSession(lesson: Lesson, initialActivityIndex = 0): LessonSession {
  const currentActivityIndex = Math.min(
    Math.max(Math.trunc(initialActivityIndex), 0),
    lesson.activities.length,
  );

  return {
    lesson,
    currentActivityIndex,
    responses: {},
    feedback: null,
    status:
      lesson.activities.length === 0 || currentActivityIndex >= lesson.activities.length
        ? 'completed'
        : 'in-progress',
  };
}

export function getCurrentActivity(session: LessonSession): LessonActivity | undefined {
  return session.lesson.activities[session.currentActivityIndex];
}

export function recordActivityResponse(
  session: LessonSession,
  activityId: ActivityId,
  response: ActivityResponse,
): LessonSession {
  return {
    ...session,
    responses: { ...session.responses, [activityId]: response },
  };
}

export function submitMultipleChoiceAnswer(
  session: LessonSession,
  selectedOptionId: string,
): LessonSession {
  const activity = getCurrentActivity(session);

  if (
    activity?.type !== 'multiple-choice' ||
    session.feedback?.activityId === activity.id ||
    !activity.options.some((option) => option.id === selectedOptionId)
  ) {
    return session;
  }

  const feedback: AnswerFeedback = {
    type: 'multiple-choice',
    activityId: activity.id,
    selectedOptionId,
    correctOptionId: activity.correctOptionId,
    isCorrect: selectedOptionId === activity.correctOptionId,
  };

  return {
    ...recordActivityResponse(session, activity.id, {
      type: 'choice',
      optionId: selectedOptionId,
    }),
    feedback,
  };
}

export function toggleSentenceBuildingToken(
  session: LessonSession,
  tokenId: string,
): LessonSession {
  const activity = getCurrentActivity(session);

  if (
    activity?.type !== 'sentence-building' ||
    session.feedback?.activityId === activity.id ||
    !activity.tokens.some((token) => token.id === tokenId)
  ) {
    return session;
  }

  const existingResponse = session.responses[activity.id];
  const selectedTokenIds =
    existingResponse?.type === 'token-order' ? existingResponse.tokenIds : [];
  const nextTokenIds = selectedTokenIds.includes(tokenId)
    ? selectedTokenIds.filter((selectedTokenId) => selectedTokenId !== tokenId)
    : [...selectedTokenIds, tokenId];

  return recordActivityResponse(session, activity.id, {
    type: 'token-order',
    tokenIds: nextTokenIds,
  });
}

export function submitSentenceBuildingAnswer(session: LessonSession): LessonSession {
  const activity = getCurrentActivity(session);

  if (
    activity?.type !== 'sentence-building' ||
    session.feedback?.activityId === activity.id
  ) {
    return session;
  }

  const response = session.responses[activity.id];
  const selectedTokenIds = response?.type === 'token-order' ? response.tokenIds : [];
  if (selectedTokenIds.length !== activity.correctTokenOrder.length) {
    return session;
  }

  const selectedSentence = buildSentenceFromTokenOrder(activity, selectedTokenIds);
  if (selectedSentence === null) {
    return session;
  }

  return {
    ...session,
    feedback: {
      type: 'sentence-building',
      activityId: activity.id,
      selectedTokenIds,
      selectedSentence,
      correctSentence: activity.completedSentence,
      isCorrect: isSentenceBuildingAnswerCorrect(activity, selectedTokenIds),
    },
  };
}

export function selectFillInTheBlankAnswer(
  session: LessonSession,
  answer: string,
): LessonSession {
  const activity = getCurrentActivity(session);

  if (
    activity?.type !== 'fill-in-the-blank' ||
    session.feedback?.activityId === activity.id ||
    !activity.options.some((option) => option.text === answer)
  ) {
    return session;
  }

  return recordActivityResponse(session, activity.id, { type: 'text', value: answer });
}

export function submitFillInTheBlankAnswer(session: LessonSession): LessonSession {
  const activity = getCurrentActivity(session);

  if (
    activity?.type !== 'fill-in-the-blank' ||
    session.feedback?.activityId === activity.id
  ) {
    return session;
  }

  const response = session.responses[activity.id];
  if (response?.type !== 'text') {
    return session;
  }

  const correctAnswer = getFirstAcceptedAnswer(activity);
  if (!correctAnswer) {
    return session;
  }

  return {
    ...session,
    feedback: {
      type: 'fill-in-the-blank',
      activityId: activity.id,
      selectedAnswer: response.value,
      correctAnswer,
      correctSentence: activity.completedSentence,
      isCorrect: isFillInAnswerCorrect(activity, response.value),
    },
  };
}

export function canAdvanceLessonSession(session: LessonSession): boolean {
  if (session.status === 'completed') {
    return false;
  }

  const activity = getCurrentActivity(session);

  if (!activity) {
    return false;
  }

  return (
    (activity.type !== 'multiple-choice' &&
      activity.type !== 'sentence-building' &&
      activity.type !== 'fill-in-the-blank') ||
    session.feedback?.activityId === activity.id
  );
}

export function advanceLessonSession(session: LessonSession): LessonSession {
  if (!canAdvanceLessonSession(session)) {
    return session;
  }

  const lastIndex = session.lesson.activities.length - 1;

  if (session.currentActivityIndex >= lastIndex) {
    return { ...session, feedback: null, status: 'completed' };
  }

  return {
    ...session,
    currentActivityIndex: session.currentActivityIndex + 1,
    feedback: null,
  };
}

export function retreatLessonSession(session: LessonSession): LessonSession {
  return {
    ...session,
    currentActivityIndex: Math.max(0, session.currentActivityIndex - 1),
    feedback: null,
    status: 'in-progress',
  };
}

export function getCorrectOption(
  activity: MultipleChoiceActivity,
): MultipleChoiceActivity['options'][number] | undefined {
  return activity.options.find((option) => option.id === activity.correctOptionId);
}

function getFirstAcceptedAnswer(activity: FillInTheBlankActivity): string | undefined {
  return activity.acceptedAnswers[0];
}
