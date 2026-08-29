import { useCallback, useState } from 'react';

import {
  advanceLessonSession,
  createLessonSession,
  recordActivityResponse,
  retreatLessonSession,
} from '@/features/lessons/lesson-session';
import type { ActivityId, ActivityResponse, Lesson } from '@/types';

export function useLessonSession(lesson: Lesson) {
  const [session, setSession] = useState(() => createLessonSession(lesson));

  const recordResponse = useCallback((activityId: ActivityId, response: ActivityResponse) => {
    setSession((current) => recordActivityResponse(current, activityId, response));
  }, []);

  const advance = useCallback(() => {
    setSession(advanceLessonSession);
  }, []);

  const goBack = useCallback(() => {
    setSession(retreatLessonSession);
  }, []);

  return { session, recordResponse, advance, goBack };
}
