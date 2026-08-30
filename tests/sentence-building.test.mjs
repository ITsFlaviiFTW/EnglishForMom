import assert from 'node:assert/strict';
import test from 'node:test';

import { essentialVerbsOneLesson } from '../src/data/lessons/essential-verbs-1.ts';
import {
  advanceLessonSession,
  canAdvanceLessonSession,
  createLessonSession,
  submitSentenceBuildingAnswer,
  toggleSentenceBuildingToken,
} from '../src/features/lessons/lesson-session.ts';
import {
  buildSentenceFromTokenOrder,
  isSentenceBuildingAnswerCorrect,
  normalizeSentenceAnswer,
} from '../src/features/lessons/sentence-building.ts';
import {
  createDefaultProgress,
  recordActivityCompletion,
} from '../src/features/progress/progress-state.ts';

const sentenceActivity = {
  id: 'build-need-towel',
  type: 'sentence-building',
  promptRomanian: 'Construiește propoziția în engleză.',
  translationRomanian: 'Am nevoie de un prosop.',
  tokens: [
    { id: 'towel-period', text: 'towel.' },
    { id: 'i', text: 'I' },
    { id: 'a', text: 'a' },
    { id: 'need', text: 'need' },
  ],
  correctTokenOrder: ['i', 'need', 'a', 'towel-period'],
  completedSentence: 'I need a towel.',
  focusItemIds: ['verb-need'],
};

const sentenceLesson = {
  id: 'sentence-test',
  schemaVersion: 1,
  title: { english: 'Sentence Test', romanian: 'Test de propoziție' },
  estimatedMinutes: 1,
  activities: [sentenceActivity],
};

test('normalizes whitespace around sentence punctuation without removing it', () => {
  assert.equal(normalizeSentenceAnswer('  Come   here ,  please !  '), 'Come here, please!');
  assert.equal(normalizeSentenceAnswer('I need a towel .'), 'I need a towel.');
});

test('builds and checks an answer from configurable token data', () => {
  assert.equal(
    buildSentenceFromTokenOrder(sentenceActivity, sentenceActivity.correctTokenOrder),
    'I need a towel.',
  );
  assert.equal(
    isSentenceBuildingAnswerCorrect(sentenceActivity, sentenceActivity.correctTokenOrder),
    true,
  );
  assert.equal(
    isSentenceBuildingAnswerCorrect(sentenceActivity, [
      'towel-period',
      'i',
      'a',
      'need',
    ]),
    false,
  );
  assert.equal(buildSentenceFromTokenOrder(sentenceActivity, ['missing-token']), null);
});

test('allows selected tokens to be removed and added back in a new order', () => {
  let session = createLessonSession(sentenceLesson);

  session = toggleSentenceBuildingToken(session, 'towel-period');
  session = toggleSentenceBuildingToken(session, 'i');
  assert.deepEqual(session.responses[sentenceActivity.id], {
    type: 'token-order',
    tokenIds: ['towel-period', 'i'],
  });

  session = toggleSentenceBuildingToken(session, 'towel-period');
  session = toggleSentenceBuildingToken(session, 'towel-period');
  assert.deepEqual(session.responses[sentenceActivity.id], {
    type: 'token-order',
    tokenIds: ['i', 'towel-period'],
  });
});

test('requires Check Answer and records correct feedback before advancing', () => {
  let session = createLessonSession(sentenceLesson);
  for (const tokenId of sentenceActivity.correctTokenOrder) {
    session = toggleSentenceBuildingToken(session, tokenId);
  }

  assert.equal(canAdvanceLessonSession(session), false);
  session = submitSentenceBuildingAnswer(session);
  assert.equal(session.feedback?.type, 'sentence-building');
  assert.equal(session.feedback?.isCorrect, true);
  assert.equal(canAdvanceLessonSession(session), true);

  session = advanceLessonSession(session);
  assert.equal(session.status, 'completed');
});

test('allows continuation after an incorrect sentence and creates a review mistake', () => {
  const activity = essentialVerbsOneLesson.activities.find(
    (candidate) => candidate.id === 'build-need-towel',
  );
  assert.equal(activity?.type, 'sentence-building');
  if (!activity || activity.type !== 'sentence-building') {
    return;
  }

  const incorrectOrder = ['towel-period', 'i', 'a', 'need'];
  let session = createLessonSession({ ...sentenceLesson, activities: [activity] });
  for (const tokenId of incorrectOrder) {
    session = toggleSentenceBuildingToken(session, tokenId);
  }
  session = submitSentenceBuildingAnswer(session);

  assert.equal(session.feedback?.isCorrect, false);
  assert.equal(canAdvanceLessonSession(session), true);

  const progress = recordActivityCompletion(createDefaultProgress(), {
    lesson: essentialVerbsOneLesson,
    activity,
    response: { type: 'token-order', tokenIds: incorrectOrder },
    correct: false,
    completedAt: '2026-08-29T18:00:00.000Z',
  });

  assert.equal(progress.incorrectAnswers, 1);
  assert.equal(progress.vocabulary['verb-need']?.incorrectAttempts, 1);
  assert.equal(progress.reviewItems['vocabulary:verb-need']?.priority, 3);
  assert.equal(progress.reviewItems['vocabulary:verb-need']?.example?.english, 'I need a towel.');
});
