import type {
  ActivityResponse,
  LearnerProgress,
  Lesson,
  LessonActivity,
  LessonId,
  LessonProgress,
} from '@/types';
import {
  addReviewMistakes,
  createReviewSeeds,
  type ReviewableActivity,
} from '../review/review-queue.ts';
import { updateVocabularyMastery } from './vocabulary-mastery.ts';

export const CURRENT_PROGRESS_SCHEMA_VERSION = 3 as const;

export type ActivityCompletion = {
  lesson: Lesson;
  activity: LessonActivity;
  response: ActivityResponse;
  correct: boolean | null;
  completedAt: string;
};

export function createDefaultProgress(): LearnerProgress {
  return {
    schemaVersion: CURRENT_PROGRESS_SCHEMA_VERSION,
    currentLessonId: null,
    recentLessonId: null,
    completedLessonIds: [],
    correctAnswers: 0,
    incorrectAnswers: 0,
    lastPracticedAt: null,
    lessons: {},
    vocabulary: {},
    questionMistakes: {},
    reviewItems: {},
  };
}

export function recordLessonStarted(
  progress: LearnerProgress,
  lessonId: LessonId,
): LearnerProgress {
  if (progress.currentLessonId === lessonId && progress.recentLessonId === lessonId) {
    return progress;
  }

  return {
    ...progress,
    currentLessonId: lessonId,
    recentLessonId: lessonId,
  };
}

export function recordActivityCompletion(
  progress: LearnerProgress,
  completion: ActivityCompletion,
): LearnerProgress {
  const { lesson, activity, response, correct, completedAt } = completion;
  const activityIndex = lesson.activities.findIndex((candidate) => candidate.id === activity.id);

  if (activityIndex < 0) {
    return progress;
  }

  const existingLesson = progress.lessons[lesson.id];
  if (existingLesson?.activityResults.some((result) => result.activityId === activity.id)) {
    return progress;
  }

  const nextActivityIndex = activityIndex + 1;
  const completed = nextActivityIndex >= lesson.activities.length;
  const correctIncrement = correct === true ? 1 : 0;
  const incorrectIncrement = correct === false ? 1 : 0;
  const lessonProgress: LessonProgress = {
    lessonId: lesson.id,
    completed,
    lastCompletedActivityId: activity.id,
    nextActivityIndex,
    correctAnswers: (existingLesson?.correctAnswers ?? 0) + correctIncrement,
    incorrectAnswers: (existingLesson?.incorrectAnswers ?? 0) + incorrectIncrement,
    activityResults: [
      ...(existingLesson?.activityResults ?? []),
      {
        activityId: activity.id,
        response,
        correct,
        attempts: 1,
        completedAt,
      },
    ],
    lastPracticedAt: completedAt,
  };

  const vocabulary = updateVocabulary(progress.vocabulary, activity, correct, completedAt);
  const questionMistakes =
    activity.type === 'multiple-choice' && correct === false && response.type === 'choice'
      ? {
          ...progress.questionMistakes,
          [questionMistakeKey(lesson.id, activity.id)]: {
            lessonId: lesson.id,
            activityId: activity.id,
            incorrectAttempts:
              (progress.questionMistakes[questionMistakeKey(lesson.id, activity.id)]
                ?.incorrectAttempts ?? 0) + 1,
            lastSelectedOptionId: response.optionId,
            lastMissedAt: completedAt,
          },
        }
      : progress.questionMistakes;
  // A wrong answer, or a word or sentence she skipped saying, goes to review.
  const reviewItems =
    (activity.type === 'vocabulary-introduction' ||
      activity.type === 'example-sentence' ||
      activity.type === 'conversation-turn' ||
      activity.type === 'multiple-choice' ||
      activity.type === 'listening' ||
      activity.type === 'sentence-building' ||
      activity.type === 'fill-in-the-blank') &&
    correct === false
      ? addReviewMistakes(
          progress.reviewItems,
          createReviewSeeds(lesson, activity),
          completedAt,
        )
      : progress.reviewItems;

  return {
    ...progress,
    currentLessonId: completed ? null : lesson.id,
    recentLessonId: lesson.id,
    completedLessonIds: completed
      ? [...new Set([...progress.completedLessonIds, lesson.id])]
      : progress.completedLessonIds,
    correctAnswers: progress.correctAnswers + correctIncrement,
    incorrectAnswers: progress.incorrectAnswers + incorrectIncrement,
    lastPracticedAt: completedAt,
    lessons: { ...progress.lessons, [lesson.id]: lessonProgress },
    vocabulary,
    questionMistakes,
    reviewItems,
  };
}

/**
 * Something she got wrong while redoing a finished lesson (a dictation
 * sentence, a skipped word) goes to "Repetă". Nothing else changes: a redo
 * never touches the lesson's progress.
 */
export function recordReviewMistake(
  progress: LearnerProgress,
  lesson: Lesson,
  activity: ReviewableActivity,
  missedAt: string,
): LearnerProgress {
  const reviewItems = addReviewMistakes(
    progress.reviewItems,
    createReviewSeeds(lesson, activity),
    missedAt,
  );
  return reviewItems === progress.reviewItems ? progress : { ...progress, reviewItems };
}

export function getLessonResumeIndex(progress: LearnerProgress, lesson: Lesson): number {
  const lessonProgress = progress.lessons[lesson.id];
  if (!lessonProgress) {
    return 0;
  }

  return Math.min(Math.max(lessonProgress.nextActivityIndex, 0), lesson.activities.length);
}

export function selectContinueLessonId(
  lessonIds: readonly LessonId[],
  progress: LearnerProgress,
): LessonId | null {
  if (
    progress.currentLessonId &&
    lessonIds.includes(progress.currentLessonId) &&
    !progress.lessons[progress.currentLessonId]?.completed
  ) {
    return progress.currentLessonId;
  }

  const recentUnfinished = lessonIds
    .filter((lessonId) => {
      const lessonProgress = progress.lessons[lessonId];
      return lessonProgress && !lessonProgress.completed;
    })
    .sort((left, right) =>
      progress.lessons[right].lastPracticedAt.localeCompare(progress.lessons[left].lastPracticedAt),
    )[0];

  return (
    recentUnfinished ??
    lessonIds.find((lessonId) => !progress.completedLessonIds.includes(lessonId)) ??
    (progress.recentLessonId && lessonIds.includes(progress.recentLessonId)
      ? progress.recentLessonId
      : lessonIds[0] ?? null)
  );
}

function updateVocabulary(
  vocabulary: LearnerProgress['vocabulary'],
  activity: LessonActivity,
  correct: boolean | null,
  practicedAt: string,
): LearnerProgress['vocabulary'] {
  const vocabularyIds =
    activity.type === 'vocabulary-introduction'
      ? [activity.vocabularyId]
      : activity.type === 'multiple-choice' || activity.type === 'listening'
        ? (activity.focusItemIds ?? [])
        : activity.type === 'sentence-building'
          ? (activity.focusItemIds ?? [])
          : activity.type === 'fill-in-the-blank'
            ? (activity.focusItemIds ?? [])
            : [];

  if (vocabularyIds.length === 0) {
    return vocabulary;
  }

  const updated = { ...vocabulary };
  for (const vocabularyId of vocabularyIds) {
    updated[vocabularyId] = updateVocabularyMastery(
      vocabulary[vocabularyId],
      vocabularyId,
      correct,
      practicedAt,
    );
  }

  return updated;
}

function questionMistakeKey(lessonId: LessonId, activityId: string) {
  return `${lessonId}:${activityId}`;
}
