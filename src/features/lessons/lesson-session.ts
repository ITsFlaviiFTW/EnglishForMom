import type {
  ActivityId,
  ActivityResponse,
  Lesson,
  LessonActivity,
  MultipleChoiceActivity,
} from '@/types';

export type LessonSessionStatus = 'in-progress' | 'completed';

export type LessonSession = {
  lesson: Lesson;
  currentActivityIndex: number;
  responses: Readonly<Partial<Record<ActivityId, ActivityResponse>>>;
  feedback: AnswerFeedback | null;
  status: LessonSessionStatus;
};

export type AnswerFeedback = {
  activityId: ActivityId;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
};

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

export function canAdvanceLessonSession(session: LessonSession): boolean {
  if (session.status === 'completed') {
    return false;
  }

  const activity = getCurrentActivity(session);

  if (!activity) {
    return false;
  }

  return activity.type !== 'multiple-choice' || session.feedback?.activityId === activity.id;
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
