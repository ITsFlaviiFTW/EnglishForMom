import assert from 'node:assert/strict';
import test from 'node:test';

import { getCourses } from '../src/data/courses/course-catalog.ts';
import { getLessonById } from '../src/data/lessons/lesson-catalog.ts';
import {
  canChooseRedo,
  countRo,
  DICTATION_SIZE,
  getDictationSentences,
  getRedoWords,
  parseRedoMode,
  wordsMinutes,
} from '../src/features/lessons/lesson-redo.ts';
import {
  createDefaultProgress,
  recordReviewMistake,
} from '../src/features/progress/progress-state.ts';

const courseLessons = getCourses().flatMap((course) =>
  course.units.flatMap((unit) => {
    const lesson = unit.lessonId ? getLessonById(unit.lessonId) : undefined;
    return lesson ? [lesson] : [];
  }),
);

test('the dictation is the first example of each word, numbered like the workbook', () => {
  const lesson = getLessonById('out-1-help-phrases');
  const sentences = getDictationSentences(lesson);

  assert.equal(sentences.length, DICTATION_SIZE);
  assert.deepEqual(
    sentences.map((sentence) => sentence.number),
    [1, 2, 3, 4, 5, 6, 7, 8],
  );
  assert.equal(sentences[0].english, 'Excuse me, where is the milk?');
  assert.equal(sentences[1].english, "Sorry? I didn't hear you.");
  assert.equal(sentences[1].romanian, 'Poftim? Nu v-am auzit.');
});

test('every lesson with word cards has a full dictation with sound', () => {
  for (const lesson of courseLessons.filter(canChooseRedo)) {
    const sentences = getDictationSentences(lesson);
    assert.equal(sentences.length, DICTATION_SIZE, lesson.id);
    for (const sentence of sentences) {
      assert.ok(sentence.audio, `${lesson.id}: ${sentence.english}`);
      // "Nu chiar" sends the sentence itself to review.
      assert.equal(sentence.activity.type, 'example-sentence', `${lesson.id}: ${sentence.english}`);
    }
  }
});

test('conversations have no choice: they start again', () => {
  const conversation = getLessonById('talk-1-store-help');
  assert.equal(canChooseRedo(conversation), false);
  assert.deepEqual(getDictationSentences(conversation), []);
});

test('the words redo is only the word cards', () => {
  const lesson = getLessonById('out-1-help-phrases');
  const words = getRedoWords(lesson);
  assert.equal(words.length, 8);
  assert.ok(words.every((activity) => activity.type === 'vocabulary-introduction'));
});

test('only known redo modes are accepted', () => {
  assert.equal(parseRedoMode('words'), 'words');
  assert.equal(parseRedoMode('dictation'), 'dictation');
  assert.equal(parseRedoMode('all'), 'all');
  assert.equal(parseRedoMode('something'), null);
  assert.equal(parseRedoMode(undefined), null);
  assert.equal(parseRedoMode(['words']), null);
});

test('counts read naturally in Romanian', () => {
  assert.equal(countRo(1, 'pas', 'pași'), '1 pas');
  assert.equal(countRo(8, 'pas', 'pași'), '8 pași');
  assert.equal(countRo(19, 'pas', 'pași'), '19 pași');
  assert.equal(countRo(23, 'pas', 'pași'), '23 de pași');
  assert.equal(countRo(101, 'pas', 'pași'), '101 pași');
  assert.equal(wordsMinutes(8), 3);
  assert.equal(wordsMinutes(1), 1);
});

test('a missed dictation sentence goes to review and nothing else changes', () => {
  const lesson = getLessonById('out-1-help-phrases');
  const [, sentence] = getDictationSentences(lesson);
  const progress = createDefaultProgress();
  const missedAt = '2026-11-24T10:00:00.000Z';

  const updated = recordReviewMistake(progress, lesson, sentence.activity, missedAt);
  const items = Object.values(updated.reviewItems);

  assert.equal(items.length, 1);
  assert.equal(items[0].content.english, "Sorry? I didn't hear you.");
  assert.equal(items[0].lastMissedAt, missedAt);
  assert.ok(items[0].priority > 0);
  assert.deepEqual(updated.lessons, progress.lessons);
  assert.deepEqual(updated.completedLessonIds, progress.completedLessonIds);
  assert.equal(updated.incorrectAnswers, progress.incorrectAnswers);
});
