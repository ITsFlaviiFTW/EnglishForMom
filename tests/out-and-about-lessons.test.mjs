import assert from 'node:assert/strict';
import test from 'node:test';

import {
  dialogueAudioSources,
  generatedEnglishAudioSources,
} from '../src/data/audio/english-audio-catalog.ts';
import { getCourseById } from '../src/data/courses/course-catalog.ts';
import { getLessonById } from '../src/data/lessons/lesson-catalog.ts';
import {
  advanceLessonSession,
  canAdvanceLessonSession,
  createLessonSession,
  submitMultipleChoiceAnswer,
} from '../src/features/lessons/lesson-session.ts';
import { recordActivityCompletion, createDefaultProgress } from '../src/features/progress/progress-state.ts';

const course = getCourseById('out-and-about');
const lessons = course.units.map((unit) => getLessonById(unit.lessonId));

test('"Out and About" is the first course and its first lesson is open from the start', () => {
  assert.equal(course.level, 1);
  assert.deepEqual(course.units[0].prerequisiteLessonIds, []);
  assert.deepEqual(
    lessons.map((lesson) => lesson.id),
    ['out-1-help-phrases', 'out-2-prices', 'out-3-at-the-store', 'out-4-checkout'],
  );
});

for (const lesson of lessons) {
  test(`${lesson.title.english}: every phrase has a translation, an example and audio`, () => {
    const phrases = lesson.activities.filter((activity) => activity.type === 'vocabulary-introduction');
    assert.ok(phrases.length >= 8);
    const audioKeys = new Set(generatedEnglishAudioSources.map((source) => source.key));

    for (const phrase of phrases) {
      assert.ok(phrase.content.english && phrase.content.romanian);
      assert.ok(audioKeys.has(phrase.audio.key), phrase.audio.key);
      assert.equal(phrase.examples.length, 1);
      assert.ok(audioKeys.has(phrase.examples[0].audio.key));
      // Romanian text uses comma-below ș/ț, never the cedilla look-alikes.
      assert.doesNotMatch(
        [phrase.content.romanian, phrase.examples[0].romanian, phrase.noteRomanian ?? ''].join(' '),
        /[şţŞŢ]/,
      );
    }
  });

  test(`${lesson.title.english}: ends with real-speed dialogue questions`, () => {
    const listening = lesson.activities.filter((activity) => activity.type === 'listening');
    const dialogueKeys = new Set(dialogueAudioSources.map((source) => source.key));
    const phraseIds = new Set(
      lesson.activities.flatMap((activity) =>
        activity.type === 'vocabulary-introduction' ? [activity.vocabularyId] : [],
      ),
    );

    assert.ok(listening.length >= 2);
    for (const activity of listening) {
      assert.ok(dialogueKeys.has(activity.audio.key), activity.audio.key);
      assert.ok(activity.options.some((option) => option.id === activity.correctOptionId));
      assert.equal(new Set(activity.options.map((option) => option.id)).size, activity.options.length);
      assert.ok(activity.transcript.some((line) => line.speaker === 'staff'));
      for (const line of activity.transcript) {
        assert.ok(line.english && line.romanian);
      }
      for (const focusId of activity.focusItemIds ?? []) {
        assert.ok(phraseIds.has(focusId), `${activity.id} practises unknown phrase ${focusId}`);
      }
    }
  });
}

test('dialogue audio keys are unique and separate from the lesson recordings', () => {
  const dialogueKeys = dialogueAudioSources.map((source) => source.key);
  const lessonKeys = new Set(generatedEnglishAudioSources.map((source) => source.key));

  assert.equal(new Set(dialogueKeys).size, dialogueKeys.length);
  assert.deepEqual(
    dialogueKeys.filter((key) => lessonKeys.has(key)),
    [],
  );
});

test('a dialogue question must be answered before continuing, and a miss goes to review', () => {
  const lesson = getLessonById('out-4-checkout');
  const index = lesson.activities.findIndex((activity) => activity.type === 'listening');
  const activity = lesson.activities[index];
  let session = createLessonSession(lesson, index);

  assert.equal(canAdvanceLessonSession(session), false);

  const wrongOption = activity.options.find((option) => option.id !== activity.correctOptionId);
  session = submitMultipleChoiceAnswer(session, wrongOption.id);
  assert.equal(session.feedback?.isCorrect, false);
  assert.equal(canAdvanceLessonSession(session), true);
  assert.equal(advanceLessonSession(session).currentActivityIndex, index + 1);

  const progress = recordActivityCompletion(createDefaultProgress(), {
    lesson,
    activity,
    response: { type: 'choice', optionId: wrongOption.id },
    correct: false,
    completedAt: '2026-11-14T12:00:00.000Z',
  });
  assert.equal(progress.incorrectAnswers, 1);
  assert.ok(progress.reviewItems[`vocabulary:${activity.focusItemIds[0]}`]);
});
