import assert from 'node:assert/strict';
import test from 'node:test';

import { kitchenBasicsLesson } from '../src/data/lessons/kitchen-basics.ts';
import {
  createDefaultProgress,
  getLessonResumeIndex,
  recordActivityCompletion,
  recordLessonStarted,
  selectContinueLessonId,
} from '../src/features/progress/progress-state.ts';

const practicedAt = '2026-08-29T15:30:00.000Z';

function complete(progress, activity, selectedOptionId) {
  const isQuestion = activity.type === 'multiple-choice';
  const optionId = selectedOptionId ?? (isQuestion ? activity.correctOptionId : undefined);

  return recordActivityCompletion(progress, {
    lesson: kitchenBasicsLesson,
    activity,
    response: isQuestion
      ? { type: 'choice', optionId }
      : { type: 'acknowledged' },
    correct: isQuestion ? optionId === activity.correctOptionId : null,
    completedAt: practicedAt,
  });
}

test('starts with safe empty progress and records the recent lesson', () => {
  const empty = createDefaultProgress();
  const started = recordLessonStarted(empty, kitchenBasicsLesson.id);

  assert.equal(empty.schemaVersion, 2);
  assert.deepEqual(empty.completedLessonIds, []);
  assert.equal(started.currentLessonId, kitchenBasicsLesson.id);
  assert.equal(started.recentLessonId, kitchenBasicsLesson.id);
});

test('records a completed step and resumes at the following activity', () => {
  const firstActivity = kitchenBasicsLesson.activities[0];
  const progress = complete(createDefaultProgress(), firstActivity);

  assert.equal(progress.lessons[kitchenBasicsLesson.id].lastCompletedActivityId, firstActivity.id);
  assert.equal(progress.lessons[kitchenBasicsLesson.id].nextActivityIndex, 1);
  assert.equal(getLessonResumeIndex(progress, kitchenBasicsLesson), 1);
  assert.equal(progress.vocabulary.fridge.familiarity, 'new');
  assert.equal(progress.lastPracticedAt, practicedAt);
});

test('tracks an incorrect question and its related vocabulary separately', () => {
  const question = kitchenBasicsLesson.activities.find(
    (activity) => activity.id === 'recall-stove-ro',
  );
  assert.equal(question?.type, 'multiple-choice');

  const progress = complete(createDefaultProgress(), question, 'fridge');
  const mistake = progress.questionMistakes[`${kitchenBasicsLesson.id}:${question.id}`];

  assert.equal(progress.incorrectAnswers, 1);
  assert.equal(progress.correctAnswers, 0);
  assert.equal(progress.vocabulary.stove.incorrectAttempts, 1);
  assert.equal(mistake.incorrectAttempts, 1);
  assert.equal(mistake.lastSelectedOptionId, 'fridge');
  assert.equal(progress.reviewItems['vocabulary:stove'].priority, 3);
  assert.deepEqual(progress.reviewItems['vocabulary:stove'].content, {
    english: 'stove',
    romanian: 'aragaz',
  });
  assert.equal(progress.reviewItems['vocabulary:stove'].example?.english, 'The stove is next to the fridge.');
});

test('finishes a lesson, preserves totals, and does not count duplicate saves', () => {
  let progress = createDefaultProgress();
  for (const activity of kitchenBasicsLesson.activities) {
    progress = complete(progress, activity);
  }

  const afterDuplicate = complete(progress, kitchenBasicsLesson.activities.at(-1));

  assert.equal(progress.lessons[kitchenBasicsLesson.id].completed, true);
  assert.deepEqual(progress.completedLessonIds, [kitchenBasicsLesson.id]);
  assert.equal(progress.correctAnswers, 8);
  assert.equal(progress.incorrectAnswers, 0);
  assert.equal(progress.currentLessonId, null);
  assert.equal(getLessonResumeIndex(progress, kitchenBasicsLesson), 32);
  assert.strictEqual(afterDuplicate, progress);
});

test('chooses the current unfinished lesson before a fresh lesson', () => {
  const progress = recordLessonStarted(createDefaultProgress(), 'recent-lesson');

  assert.equal(selectContinueLessonId(['fresh-lesson', 'recent-lesson'], progress), 'recent-lesson');
});
