import type {
  LearnerProgress,
  Lesson,
  MultipleChoiceActivity,
  ReviewItemProgress,
  VocabularyIntroductionActivity,
} from '@/types';

export const REVIEW_SESSION_SIZE = 5;
export const INITIAL_REVIEW_PRIORITY = 3;
export const MAX_REVIEW_PRIORITY = 10;

export type ReviewItemSeed = Pick<
  ReviewItemProgress,
  'id' | 'kind' | 'lessonId' | 'sourceActivityId' | 'learningItemId' | 'content' | 'example'
>;

export type ReviewAnswer = {
  itemId: string;
  correct: boolean;
  answeredAt: string;
};

export function createReviewSeeds(
  lesson: Lesson,
  activity: MultipleChoiceActivity,
): readonly ReviewItemSeed[] {
  const vocabularyActivities = lesson.activities.filter(
    (candidate): candidate is VocabularyIntroductionActivity =>
      candidate.type === 'vocabulary-introduction',
  );
  const vocabularySeeds = (activity.focusItemIds ?? []).flatMap((learningItemId) => {
    const vocabulary = vocabularyActivities.find(
      (candidate) => candidate.vocabularyId === learningItemId,
    );
    if (!vocabulary) {
      return [];
    }

    return [
      {
        id: `vocabulary:${learningItemId}`,
        kind: 'vocabulary',
        lessonId: lesson.id,
        sourceActivityId: activity.id,
        learningItemId,
        content: vocabulary.content,
        example: vocabulary.examples?.[0]
          ? {
              english: vocabulary.examples[0].english,
              romanian: vocabulary.examples[0].romanian,
            }
          : undefined,
      } satisfies ReviewItemSeed,
    ];
  });

  if (vocabularySeeds.length > 0) {
    return vocabularySeeds;
  }

  const correctOption = activity.options.find((option) => option.id === activity.correctOptionId);
  if (!correctOption) {
    return [];
  }

  return [
    {
      id: `comprehension:${lesson.id}:${activity.id}`,
      kind: 'comprehension',
      lessonId: lesson.id,
      sourceActivityId: activity.id,
      learningItemId: activity.id,
      content:
        activity.promptLanguage === 'english'
          ? {
              english: activity.prompt,
              romanian: activity.explanationRomanian ?? correctOption.text,
            }
          : {
              english: correctOption.text,
              romanian: activity.prompt,
            },
    },
  ];
}

export function addReviewMistakes(
  items: LearnerProgress['reviewItems'],
  seeds: readonly ReviewItemSeed[],
  missedAt: string,
  occurrences = 1,
): LearnerProgress['reviewItems'] {
  if (seeds.length === 0 || occurrences < 1) {
    return items;
  }

  const updated = { ...items };
  for (const seed of seeds) {
    const existing = items[seed.id];
    updated[seed.id] = {
      ...seed,
      priority: Math.min(
        MAX_REVIEW_PRIORITY,
        existing
          ? existing.priority + 2 * occurrences
          : INITIAL_REVIEW_PRIORITY + 2 * (occurrences - 1),
      ),
      correctAttempts: existing?.correctAttempts ?? 0,
      incorrectAttempts: (existing?.incorrectAttempts ?? 0) + occurrences,
      correctStreak: 0,
      lastMissedAt: missedAt,
      lastReviewedAt: existing?.lastReviewedAt ?? null,
    };
  }

  return updated;
}

export function recordReviewAnswer(
  progress: LearnerProgress,
  answer: ReviewAnswer,
): LearnerProgress {
  const item = progress.reviewItems[answer.itemId];
  if (!item) {
    return progress;
  }

  const reviewItem: ReviewItemProgress = answer.correct
    ? {
        ...item,
        priority: Math.max(0, item.priority - 1),
        correctAttempts: item.correctAttempts + 1,
        correctStreak: item.correctStreak + 1,
        lastReviewedAt: answer.answeredAt,
      }
    : {
        ...item,
        priority: Math.min(MAX_REVIEW_PRIORITY, item.priority + 2),
        incorrectAttempts: item.incorrectAttempts + 1,
        correctStreak: 0,
        lastMissedAt: answer.answeredAt,
        lastReviewedAt: answer.answeredAt,
      };

  return {
    ...progress,
    correctAnswers: progress.correctAnswers + (answer.correct ? 1 : 0),
    incorrectAnswers: progress.incorrectAnswers + (answer.correct ? 0 : 1),
    lastPracticedAt: answer.answeredAt,
    reviewItems: { ...progress.reviewItems, [item.id]: reviewItem },
  };
}

export function prioritizeReviewItems(
  items: LearnerProgress['reviewItems'],
  limit = REVIEW_SESSION_SIZE,
): readonly ReviewItemProgress[] {
  return Object.values(items)
    .filter((item) => item.priority > 0)
    .sort(
      (left, right) =>
        right.priority - left.priority ||
        right.incorrectAttempts - left.incorrectAttempts ||
        (left.lastReviewedAt ?? left.lastMissedAt).localeCompare(
          right.lastReviewedAt ?? right.lastMissedAt,
        ) ||
        left.id.localeCompare(right.id),
    )
    .slice(0, Math.max(0, limit));
}

export function getDueReviewCount(items: LearnerProgress['reviewItems']): number {
  return Object.values(items).filter((item) => item.priority > 0).length;
}

export function backfillReviewItems(
  progress: LearnerProgress,
  lessons: readonly Lesson[],
): LearnerProgress {
  let reviewItems = progress.reviewItems;

  for (const mistake of Object.values(progress.questionMistakes)) {
    const lesson = lessons.find((candidate) => candidate.id === mistake.lessonId);
    const activity = lesson?.activities.find(
      (candidate): candidate is MultipleChoiceActivity =>
        candidate.id === mistake.activityId && candidate.type === 'multiple-choice',
    );
    if (!lesson || !activity) {
      continue;
    }

    const missingSeeds = createReviewSeeds(lesson, activity).filter(
      (seed) => !reviewItems[seed.id],
    );
    reviewItems = addReviewMistakes(
      reviewItems,
      missingSeeds,
      mistake.lastMissedAt,
      mistake.incorrectAttempts,
    );
  }

  return reviewItems === progress.reviewItems ? progress : { ...progress, reviewItems };
}
