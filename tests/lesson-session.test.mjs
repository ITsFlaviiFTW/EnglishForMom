import assert from 'node:assert/strict';
import test from 'node:test';

import { developmentLesson } from '../src/data/lessons/development-lesson.ts';
import {
  advanceLessonSession,
  canAdvanceLessonSession,
  createLessonSession,
  getCurrentActivity,
  submitMultipleChoiceAnswer,
} from '../src/features/lessons/lesson-session.ts';

function reachQuestion() {
  let session = createLessonSession(developmentLesson);
  session = advanceLessonSession(session);
  session = advanceLessonSession(session);
  return session;
}

test('advances through instructional activities in order', () => {
  let session = createLessonSession(developmentLesson);

  assert.equal(session.currentActivityIndex, 0);
  assert.equal(getCurrentActivity(session)?.type, 'vocabulary-introduction');

  session = advanceLessonSession(session);

  assert.equal(session.currentActivityIndex, 1);
  assert.equal(getCurrentActivity(session)?.type, 'example-sentence');
});

test('does not advance a multiple-choice activity before an answer', () => {
  const session = reachQuestion();
  const unchangedSession = advanceLessonSession(session);

  assert.equal(canAdvanceLessonSession(session), false);
  assert.equal(unchangedSession.currentActivityIndex, session.currentActivityIndex);
  assert.equal(unchangedSession.status, 'in-progress');
});

test('records clear feedback for a correct answer', () => {
  const session = submitMultipleChoiceAnswer(reachQuestion(), 'fridge');

  assert.equal(session.feedback?.isCorrect, true);
  assert.deepEqual(session.responses['question-fridge'], {
    type: 'choice',
    optionId: 'fridge',
  });
  assert.equal(canAdvanceLessonSession(session), true);
});

test('allows the learner to continue and finish after an incorrect answer', () => {
  let session = submitMultipleChoiceAnswer(reachQuestion(), 'oven');

  assert.equal(session.feedback?.isCorrect, false);
  assert.equal(session.feedback?.correctOptionId, 'fridge');
  assert.equal(canAdvanceLessonSession(session), true);

  session = advanceLessonSession(session);

  assert.equal(session.status, 'completed');
  assert.equal(session.feedback, null);
});
