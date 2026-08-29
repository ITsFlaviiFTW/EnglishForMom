import type { ActivityResult, LessonId } from '@/types';

export type ReviewQueueItem = {
  lessonId: LessonId;
  activityId: string;
  missedAt: string;
};

export function createReviewQueueItems(
  lessonId: LessonId,
  results: readonly ActivityResult[],
): readonly ReviewQueueItem[] {
  return results
    .filter((result) => result.correct === false)
    .map((result) => ({
      lessonId,
      activityId: result.activityId,
      missedAt: result.completedAt,
    }));
}
