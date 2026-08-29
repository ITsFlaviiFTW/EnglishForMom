import assert from 'node:assert/strict';
import test from 'node:test';

import { kitchenBasicsLesson } from '../src/data/lessons/kitchen-basics.ts';
import { createDefaultProgress } from '../src/features/progress/progress-state.ts';
import {
  addReviewMistakes,
  createReviewSeeds,
  getDueReviewCount,
  prioritizeReviewItems,
  recordReviewAnswer,
} from '../src/features/review/review-queue.ts';

const firstMiss = '2026-08-20T10:00:00.000Z';
const laterMiss = '2026-08-21T10:00:00.000Z';

function getQuestion(id) {
  const activity = kitchenBasicsLesson.activities.find((candidate) => candidate.id === id);
  assert.equal(activity?.type, 'multiple-choice');
  return activity;
}

function createMissedItem(questionId, missedAt = firstMiss) {
  const seeds = createReviewSeeds(kitchenBasicsLesson, getQuestion(questionId));
  return addReviewMistakes({}, seeds, missedAt);
}

test('creates a review item with translation and example context', () => {
  const items = createMissedItem('recall-stove-ro');
  const item = items['vocabulary:stove'];

  assert.equal(item.priority, 3);
  assert.equal(item.incorrectAttempts, 1);
  assert.deepEqual(item.content, { english: 'stove', romanian: 'aragaz' });
  assert.deepEqual(item.example, {
    english: 'The stove is next to the fridge.',
    romanian: 'Aragazul este lângă frigider.',
  });
});

test('another incorrect answer increases priority and resets the correct streak', () => {
  const original = createMissedItem('recall-stove-ro');
  const afterCorrect = recordReviewAnswer(
    { ...createDefaultProgress(), reviewItems: original },
    { itemId: 'vocabulary:stove', correct: true, answeredAt: laterMiss },
  );
  const updated = addReviewMistakes(
    afterCorrect.reviewItems,
    createReviewSeeds(kitchenBasicsLesson, getQuestion('recall-stove-ro')),
    laterMiss,
  );

  assert.equal(updated['vocabulary:stove'].priority, 4);
  assert.equal(updated['vocabulary:stove'].incorrectAttempts, 2);
  assert.equal(updated['vocabulary:stove'].correctStreak, 0);
});

test('repeated correct reviews reduce priority until the item is no longer due', () => {
  let progress = { ...createDefaultProgress(), reviewItems: createMissedItem('recall-stove-ro') };

  for (let attempt = 0; attempt < 3; attempt += 1) {
    progress = recordReviewAnswer(progress, {
      itemId: 'vocabulary:stove',
      correct: true,
      answeredAt: `2026-08-2${attempt + 2}T10:00:00.000Z`,
    });
  }

  assert.equal(progress.reviewItems['vocabulary:stove'].priority, 0);
  assert.equal(progress.reviewItems['vocabulary:stove'].correctStreak, 3);
  assert.equal(getDueReviewCount(progress.reviewItems), 0);
  assert.deepEqual(prioritizeReviewItems(progress.reviewItems), []);
});

test('an incorrect review increases priority by two and stays due', () => {
  const progress = recordReviewAnswer(
    { ...createDefaultProgress(), reviewItems: createMissedItem('recall-stove-ro') },
    { itemId: 'vocabulary:stove', correct: false, answeredAt: laterMiss },
  );

  assert.equal(progress.reviewItems['vocabulary:stove'].priority, 5);
  assert.equal(progress.reviewItems['vocabulary:stove'].incorrectAttempts, 2);
  assert.equal(getDueReviewCount(progress.reviewItems), 1);
});

test('prioritization is deterministic by priority, mistakes, age, then id', () => {
  const stove = createMissedItem('recall-stove-ro', laterMiss);
  const sink = createMissedItem('recall-sink-ro', firstMiss);
  const spoon = addReviewMistakes(
    createMissedItem('recall-spoon-ro', laterMiss),
    createReviewSeeds(kitchenBasicsLesson, getQuestion('recall-spoon-ro')),
    laterMiss,
  );
  const items = { ...stove, ...sink, ...spoon };

  assert.deepEqual(
    prioritizeReviewItems(items).map((item) => item.id),
    ['vocabulary:spoon', 'vocabulary:sink', 'vocabulary:stove'],
  );
});
