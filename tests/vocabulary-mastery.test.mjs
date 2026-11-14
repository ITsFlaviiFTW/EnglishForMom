import assert from 'node:assert/strict';
import test from 'node:test';

import { createDefaultProgress } from '../src/features/progress/progress-state.ts';
import { summarizeProgress } from '../src/features/progress/progress-summary.ts';
import {
  MAX_MASTERY_SCORE,
  deriveMasteryScoreFromAttempts,
  getVocabularyMasteryState,
  updateVocabularyMastery,
} from '../src/features/progress/vocabulary-mastery.ts';

const practicedAt = '2026-08-29T21:00:00.000Z';

test('derives the four mastery states from explicit score boundaries', () => {
  assert.equal(getVocabularyMasteryState(0, 0, 0), 'new');
  assert.equal(getVocabularyMasteryState(0, 0, 1), 'learning');
  assert.equal(getVocabularyMasteryState(2, 2, 0), 'learning');
  assert.equal(getVocabularyMasteryState(3, 3, 0), 'familiar');
  assert.equal(getVocabularyMasteryState(5, 5, 0), 'familiar');
  assert.equal(getVocabularyMasteryState(6, 6, 0), 'strong');
});

test('gradually raises mastery and lets mistakes reduce it', () => {
  let vocabulary;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    vocabulary = updateVocabularyMastery(vocabulary, 'towel', true, practicedAt);
  }

  assert.equal(vocabulary.masteryScore, 6);
  assert.equal(vocabulary.masteryState, 'strong');

  vocabulary = updateVocabularyMastery(vocabulary, 'towel', false, practicedAt);
  assert.equal(vocabulary.masteryScore, 4);
  assert.equal(vocabulary.masteryState, 'familiar');

  vocabulary = updateVocabularyMastery(vocabulary, 'towel', false, practicedAt);
  assert.equal(vocabulary.masteryScore, 2);
  assert.equal(vocabulary.masteryState, 'learning');
});

test('keeps mastery scores inside a small deterministic range', () => {
  assert.equal(deriveMasteryScoreFromAttempts(20, 0), MAX_MASTERY_SCORE);
  assert.equal(deriveMasteryScoreFromAttempts(0, 20), 0);

  const introduced = updateVocabularyMastery(undefined, 'fridge', null, practicedAt);
  assert.equal(introduced.masteryScore, 0);
  assert.equal(introduced.masteryState, 'new');
});

test('summarizes mastery without exposing raw scores', () => {
  const progress = {
    ...createDefaultProgress(),
    vocabulary: {
      fridge: updateVocabularyMastery(undefined, 'fridge', null, practicedAt),
      towel: updateVocabularyMastery(undefined, 'towel', true, practicedAt),
      sink: {
        ...updateVocabularyMastery(undefined, 'sink', true, practicedAt),
        masteryScore: 3,
        masteryState: 'familiar',
      },
      spoon: {
        ...updateVocabularyMastery(undefined, 'spoon', true, practicedAt),
        masteryScore: 6,
        masteryState: 'strong',
      },
    },
  };

  assert.deepEqual(summarizeProgress(progress), {
    wordsIntroduced: 4,
    wordsLearning: 1,
    wordsFamiliar: 1,
    wordsStrong: 1,
  });
});
