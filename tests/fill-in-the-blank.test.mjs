import assert from 'node:assert/strict';
import test from 'node:test';

import { essentialVerbsOneLesson } from '../src/data/lessons/essential-verbs-1.ts';
import {
  canAdvanceLessonSession,
  createLessonSession,
  selectFillInTheBlankAnswer,
  submitFillInTheBlankAnswer,
} from '../src/features/lessons/lesson-session.ts';
import {
  isFillInAnswerCorrect,
  normalizeFillInAnswer,
} from '../src/features/lessons/fill-in-the-blank.ts';
import {
  createDefaultProgress,
  recordActivityCompletion,
} from '../src/features/progress/progress-state.ts';

const fillActivity = {
  id: 'fill-wash-dishes',
  type: 'fill-in-the-blank',
  sentence: 'I ___ the dishes every day.',
  completedSentence: 'I wash the dishes every day.',
  translationRomanian: 'Spăl vasele în fiecare zi.',
  options: [
    { id: 'wash', text: 'wash' },
    { id: 'sleep', text: 'sleep' },
    { id: 'drink', text: 'drink' },
  ],
  acceptedAnswers: ['wash'],
  focusItemIds: ['wash'],
};

const fillLesson = {
  id: 'fill-test',
  schemaVersion: 1,
  title: { english: 'Fill Test', romanian: 'Test de completare' },
  estimatedMinutes: 1,
  activities: [fillActivity],
};

test('normalizes fill-in answers without making content case or spacing sensitive', () => {
  assert.equal(normalizeFillInAnswer('  WASH  '), 'wash');
  assert.equal(normalizeFillInAnswer('coffee   table'), 'coffee table');
  assert.equal(isFillInAnswerCorrect(fillActivity, ' Wash '), true);
  assert.equal(isFillInAnswerCorrect(fillActivity, 'sleep'), false);
});

test('stores a configurable option and allows changing it before checking', () => {
  let session = createLessonSession(fillLesson);

  session = selectFillInTheBlankAnswer(session, 'sleep');
  session = selectFillInTheBlankAnswer(session, 'wash');

  assert.deepEqual(session.responses[fillActivity.id], { type: 'text', value: 'wash' });
  assert.equal(canAdvanceLessonSession(session), false);
});

test('requires an answer and Check Answer before allowing the learner to continue', () => {
  const emptySession = submitFillInTheBlankAnswer(createLessonSession(fillLesson));
  assert.equal(emptySession.feedback, null);

  let session = selectFillInTheBlankAnswer(createLessonSession(fillLesson), 'wash');
  session = submitFillInTheBlankAnswer(session);

  assert.deepEqual(session.feedback, {
    type: 'fill-in-the-blank',
    activityId: fillActivity.id,
    selectedAnswer: 'wash',
    correctAnswer: 'wash',
    correctSentence: 'I wash the dishes every day.',
    isCorrect: true,
  });
  assert.equal(canAdvanceLessonSession(session), true);
});

test('an incorrect fill-in answer updates progress and creates a contextual review item', () => {
  const activity = essentialVerbsOneLesson.activities.find(
    (candidate) => candidate.id === 'fill-need-socks',
  );
  assert.equal(activity?.type, 'fill-in-the-blank');
  if (!activity || activity.type !== 'fill-in-the-blank') {
    return;
  }

  let session = createLessonSession({ ...fillLesson, activities: [activity] });
  session = selectFillInTheBlankAnswer(session, 'need');
  session = submitFillInTheBlankAnswer(session);

  assert.equal(session.feedback?.isCorrect, false);
  assert.equal(canAdvanceLessonSession(session), true);

  const progress = recordActivityCompletion(createDefaultProgress(), {
    lesson: essentialVerbsOneLesson,
    activity,
    response: { type: 'text', value: 'need' },
    correct: false,
    completedAt: '2026-08-29T20:00:00.000Z',
  });

  assert.equal(progress.incorrectAnswers, 1);
  assert.equal(progress.vocabulary['verb-need']?.incorrectAttempts, 1);
  assert.equal(progress.reviewItems['vocabulary:verb-need']?.priority, 3);
  assert.equal(progress.reviewItems['vocabulary:verb-need']?.content.english, 'to need');
});
