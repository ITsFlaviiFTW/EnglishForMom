import { getLessonById } from '@/data/lessons/lesson-catalog';
import type { AudioSource, ReviewItemProgress } from '@/types';

/** Finds the recorded English audio for a review item, if the lesson has one. */
export function findReviewItemAudio(item: ReviewItemProgress): AudioSource | undefined {
  const lesson = getLessonById(item.lessonId);
  if (!lesson) {
    return undefined;
  }

  if (item.kind === 'vocabulary') {
    for (const activity of lesson.activities) {
      if (
        activity.type === 'vocabulary-introduction' &&
        activity.vocabularyId === item.learningItemId
      ) {
        return activity.audio;
      }
    }
    return undefined;
  }

  const source = lesson.activities.find((activity) => activity.id === item.sourceActivityId);
  if (source?.type === 'fill-in-the-blank') {
    return source.audio;
  }
  if (source?.type === 'example-sentence') {
    return source.sentence.audio;
  }
  if (source?.type === 'conversation-turn') {
    return source.responseAudio;
  }
  return undefined;
}
