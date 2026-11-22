import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';

import { getLessonById } from '../src/data/lessons/lesson-catalog.ts';
import {
  createDefaultProgress,
  recordActivityCompletion,
} from '../src/features/progress/progress-state.ts';
import {
  createAssessmentHeader,
  evaluatePronunciation,
} from '../src/features/speaking/pronunciation.ts';
import {
  MAX_SPEAKING_ATTEMPTS,
  canSkipSpeaking,
  getSpeakingTarget,
  isSpeakingStepDone,
  recordSpeakingAttempt,
  skipSpeaking,
  speakingCompletion,
} from '../src/features/speaking/speaking-gate.ts';
import { downsampleToPcm16, encodeWav } from '../src/features/speaking/wav.ts';

// Shapes and scores as Azure returned them for the app's own recordings.
const azure = (scores, words) => ({
  RecognitionStatus: 'Success',
  NBest: [
    {
      ...scores,
      Words: words.map(([Word, AccuracyScore, ErrorType]) => ({ Word, AccuracyScore, ErrorType })),
    },
  ],
});

test('the Romanian-accent reading of a word passes', () => {
  const verdict = evaluatePronunciation(
    'fridge',
    azure({ AccuracyScore: 91, CompletenessScore: 100, PronScore: 94.6 }, [['fridge', 91, 'None']]),
  );
  assert.equal(verdict.status, 'passed');
  assert.deepEqual(verdict.words, [{ text: 'fridge', status: 'good' }]);
});

test('a single word needs a little more than a sentence', () => {
  // Another word, force-matched to "plate", scored 63.
  const verdict = evaluatePronunciation(
    'plate',
    azure({ AccuracyScore: 63, CompletenessScore: 100 }, [['plate', 63, 'None']]),
  );
  assert.equal(verdict.status, 'retry');
});

test('a sentence passes with one weak word, which is still shown in red', () => {
  const verdict = evaluatePronunciation(
    'The rug is under the coffee table.',
    azure({ AccuracyScore: 74, CompletenessScore: 86 }, [
      ['the', 80, 'None'],
      ['rug', 26, 'Mispronunciation'],
      ['is', 80, 'None'],
      ['under', 94, 'None'],
      ['the', 94, 'None'],
      ['coffee', 73, 'None'],
      ['table', 70, 'None'],
    ]),
  );
  assert.equal(verdict.status, 'passed');
  assert.deepEqual(
    verdict.words.map((word) => `${word.text}:${word.status}`),
    ['The:good', 'rug:weak', 'is:good', 'under:good', 'the:good', 'coffee:good', 'table.:good'],
  );
});

test('a different sentence fails, and extra words she adds do not count', () => {
  const verdict = evaluatePronunciation(
    'The glass is on the table.',
    azure({ AccuracyScore: 52, CompletenessScore: 67 }, [
      ['the', 62, 'None'],
      ['glass', 0, 'Omission'],
      ['is', 80, 'None'],
      ['on', 80, 'None'],
      ['the', 91, 'None'],
      ['glass', 4, 'Insertion'],
      ['is', 5, 'Insertion'],
      ['table', 0, 'Omission'],
    ]),
  );
  assert.equal(verdict.status, 'retry');
  assert.deepEqual(
    verdict.words.map((word) => word.status),
    ['good', 'missed', 'good', 'good', 'good', 'missed'],
  );
});

test('leaving out too many words fails even when the rest sounds right', () => {
  const verdict = evaluatePronunciation(
    'I am in the kitchen.',
    azure({ AccuracyScore: 95 }, [
      ['i', 95, 'None'],
      ['am', 95, 'None'],
      ['in', 0, 'Omission'],
      ['the', 95, 'None'],
      ['kitchen', 0, 'Omission'],
    ]),
  );
  assert.equal(verdict.status, 'retry');
});

test('something else entirely is a retry with every word in red; silence is "not heard"', () => {
  const nothingMatched = evaluatePronunciation(
    'The milk is in the fridge.',
    azure({ AccuracyScore: 0 }, ['the', 'milk', 'is', 'in', 'the', 'fridge'].map((w) => [w, 0, 'Omission'])),
  );
  assert.equal(nothingMatched.status, 'retry');
  assert.ok(nothingMatched.words.every((word) => word.status === 'missed'));

  assert.equal(
    evaluatePronunciation('fridge', { RecognitionStatus: 'InitialSilenceTimeout' }).status,
    'not-heard',
  );
});

test('numbers and hyphens that Azure splits differently still get matched where possible', () => {
  const verdict = evaluatePronunciation(
    'two ninety-nine',
    azure({ AccuracyScore: 90 }, [
      ['two', 95, 'None'],
      ['ninety', 90, 'None'],
      ['nine', 40, 'Mispronunciation'],
    ]),
  );
  assert.equal(verdict.status, 'passed');
  assert.deepEqual(
    verdict.words.map((word) => word.status),
    ['good', 'unknown'],
  );
});

test('the assessment header is base64 UTF-8 JSON with the phrase to compare against', () => {
  const header = createAssessmentHeader('We’re out of milk.');
  const settings = JSON.parse(Buffer.from(header, 'base64').toString('utf8'));
  assert.equal(settings.ReferenceText, 'We’re out of milk.');
  assert.equal(settings.EnableMiscue, true);
  assert.equal(settings.GradingSystem, 'HundredMark');
});

test('recordings become 16 kHz, 16-bit mono WAV', () => {
  const second = new Float32Array(48000).fill(0.5);
  const pcm = downsampleToPcm16([second.subarray(0, 24000), second.subarray(24000)], 48000);
  assert.equal(pcm.length, 16000);
  assert.equal(pcm[0], Math.round(0.5 * 0x7fff));

  const wav = Buffer.from(encodeWav(pcm));
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
  assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
  assert.equal(wav.readUInt16LE(22), 1); // mono
  assert.equal(wav.readUInt32LE(24), 16000);
  assert.equal(wav.readUInt16LE(34), 16);
  assert.equal(wav.readUInt32LE(40), 32000);
  assert.equal(wav.length, 44 + 32000);
});

test('words and example sentences must be said; other steps have nothing to say', () => {
  const lesson = getLessonById('level-1-kitchen-basics');
  const word = lesson.activities.find((activity) => activity.type === 'vocabulary-introduction');
  const sentence = lesson.activities.find((activity) => activity.type === 'example-sentence');
  const question = lesson.activities.find((activity) => activity.type === 'multiple-choice');

  assert.deepEqual(getSpeakingTarget(word), { text: word.content.english, audio: word.audio });
  assert.equal(getSpeakingTarget(sentence).text, sentence.sentence.english);
  assert.equal(getSpeakingTarget(question), null);
});

test('Continue unlocks on a pass, or after five tries with "Sari peste"', () => {
  let outcome;
  assert.equal(isSpeakingStepDone(outcome), false);

  for (let attempt = 1; attempt < MAX_SPEAKING_ATTEMPTS; attempt += 1) {
    outcome = recordSpeakingAttempt(outcome, 'retry');
    assert.equal(isSpeakingStepDone(outcome), false);
    assert.equal(canSkipSpeaking(outcome), false);
  }
  outcome = recordSpeakingAttempt(outcome, 'retry');
  assert.equal(outcome.attempts, MAX_SPEAKING_ATTEMPTS);
  assert.equal(canSkipSpeaking(outcome), true);
  assert.equal(isSpeakingStepDone(outcome), false);

  const skipped = skipSpeaking(outcome);
  assert.equal(isSpeakingStepDone(skipped), true);
  assert.deepEqual(speakingCompletion(skipped), {
    response: { type: 'speaking-completed', repetitions: MAX_SPEAKING_ATTEMPTS },
    correct: false,
  });

  const passed = recordSpeakingAttempt(recordSpeakingAttempt(undefined, 'retry'), 'passed');
  assert.deepEqual(passed, { attempts: 2, status: 'passed' });
  // Trying again after passing never takes the pass away.
  assert.equal(recordSpeakingAttempt(passed, 'retry').status, 'passed');
  assert.equal(speakingCompletion(passed).correct, true);
});

test('a broken microphone or connection lets her continue without a mark', () => {
  const outcome = recordSpeakingAttempt(undefined, 'unavailable');
  assert.deepEqual(outcome, { attempts: 0, status: 'unavailable' });
  assert.equal(isSpeakingStepDone(outcome), true);
  assert.deepEqual(speakingCompletion(outcome), { response: { type: 'acknowledged' }, correct: null });
});

test('a skipped word or sentence goes to review; a passed one does not', () => {
  const lesson = getLessonById('level-1-kitchen-basics');
  const word = lesson.activities.find((activity) => activity.type === 'vocabulary-introduction');
  const sentence = lesson.activities.find((activity) => activity.type === 'example-sentence');
  const completedAt = '2026-11-21T12:00:00.000Z';
  const skipped = speakingCompletion(skipSpeaking({ attempts: 5, status: 'trying' }));

  let progress = recordActivityCompletion(createDefaultProgress(), {
    lesson,
    activity: word,
    ...skipped,
    completedAt,
  });
  progress = recordActivityCompletion(progress, { lesson, activity: sentence, ...skipped, completedAt });
  assert.deepEqual(Object.keys(progress.reviewItems).sort(), [
    `comprehension:${lesson.id}:${sentence.id}`,
    `vocabulary:${word.vocabularyId}`,
  ]);
  assert.equal(progress.reviewItems[`vocabulary:${word.vocabularyId}`].content.english, word.content.english);

  const passed = recordActivityCompletion(createDefaultProgress(), {
    lesson,
    activity: word,
    ...speakingCompletion({ attempts: 1, status: 'passed' }),
    completedAt,
  });
  assert.deepEqual(passed.reviewItems, {});
  assert.equal(passed.correctAnswers, 1);
});
