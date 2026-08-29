import type { ActivityId, ActivityResponse, Lesson } from '@/types';

export type LessonSessionStatus = 'in-progress' | 'completed';

export type LessonSession = {
  lesson: Lesson;
  currentActivityIndex: number;
  responses: Readonly<Partial<Record<ActivityId, ActivityResponse>>>;
  status: LessonSessionStatus;
};

export function createLessonSession(lesson: Lesson): LessonSession {
  return {
    lesson,
    currentActivityIndex: 0,
    responses: {},
    status: lesson.activities.length === 0 ? 'completed' : 'in-progress',
  };
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

export function advanceLessonSession(session: LessonSession): LessonSession {
  const lastIndex = session.lesson.activities.length - 1;

  if (session.currentActivityIndex >= lastIndex) {
    return { ...session, status: 'completed' };
  }

  return { ...session, currentActivityIndex: session.currentActivityIndex + 1 };
}

export function retreatLessonSession(session: LessonSession): LessonSession {
  return {
    ...session,
    currentActivityIndex: Math.max(0, session.currentActivityIndex - 1),
    status: 'in-progress',
  };
}
