import assert from 'node:assert/strict';
import test from 'node:test';

import { generatedEnglishAudioSources } from '../src/data/audio/english-audio-catalog.ts';
import { getCourseById, getCourseLessonIds } from '../src/data/courses/course-catalog.ts';
import { essentialVerbsOneLesson } from '../src/data/lessons/essential-verbs-1.ts';
import { getLessonById } from '../src/data/lessons/lesson-catalog.ts';

const introductions = essentialVerbsOneLesson.activities.filter(
  (activity) => activity.type === 'vocabulary-introduction',
);
const examples = essentialVerbsOneLesson.activities.filter(
  (activity) => activity.type === 'example-sentence',
);
const questions = essentialVerbsOneLesson.activities.filter(
  (activity) => activity.type === 'multiple-choice',
);

test('teaches all eight requested infinitives with Romanian meanings', () => {
  assert.deepEqual(
    introductions.map((activity) => [activity.content.english, activity.content.romanian]),
    [
      ['to be', 'a fi'],
      ['to have', 'a avea'],
      ['to want', 'a vrea'],
      ['to need', 'a avea nevoie'],
      ['to go', 'a merge'],
      ['to come', 'a veni'],
      ['to take', 'a lua'],
      ['to put', 'a pune'],
    ],
  );
});

test('provides practical present forms for every verb', () => {
  const expectedForms = {
    'verb-be': ['I am', 'you are', 'he / she is', 'we are', 'they are'],
    'verb-have': ['I have', 'you have', 'he / she has', 'we have', 'they have'],
    'verb-want': ['I want', 'you want', 'he / she wants', 'we want', 'they want'],
    'verb-need': ['I need', 'you need', 'he / she needs', 'we need', 'they need'],
    'verb-go': ['I go', 'you go', 'he / she goes', 'we go', 'they go'],
    'verb-come': ['I come', 'you come', 'he / she comes', 'we come', 'they come'],
    'verb-take': ['I take', 'you take', 'he / she takes', 'we take', 'they take'],
    'verb-put': ['I put', 'you put', 'he / she puts', 'we put', 'they put'],
  };

  for (const introduction of introductions) {
    assert.deepEqual(
      introduction.forms?.map((form) => form.english),
      expectedForms[introduction.vocabularyId],
    );
    assert.ok(introduction.forms?.every((form) => form.romanian.length > 0));
  }
});

test('gives every verb four translated household examples with audio', () => {
  assert.equal(examples.length, 32);

  for (const introduction of introductions) {
    const verbExamples = examples.filter((example) =>
      example.focusItemIds?.includes(introduction.vocabularyId),
    );

    assert.equal(verbExamples.length, 4, `Unexpected example count for ${introduction.vocabularyId}`);
    assert.equal(introduction.examples?.length, 4);
    assert.equal(introduction.audio?.text, introduction.content.english);
    for (const example of verbExamples) {
      assert.ok(example.sentence.english);
      assert.ok(example.sentence.romanian);
      assert.equal(example.sentence.audio?.text, example.sentence.english);
    }
  }
});

test('places two valid recall questions after each pair of verbs', () => {
  assert.equal(essentialVerbsOneLesson.activities.length, 48);
  assert.equal(questions.length, 8);

  for (let groupIndex = 0; groupIndex < 4; groupIndex += 1) {
    const groupActivities = essentialVerbsOneLesson.activities.slice(
      groupIndex * 12,
      groupIndex * 12 + 12,
    );
    assert.deepEqual(groupActivities.slice(-2).map((activity) => activity.type), [
      'multiple-choice',
      'multiple-choice',
    ]);
  }

  for (const question of questions) {
    assert.ok(question.options.some((option) => option.id === question.correctOptionId));
    assert.equal(question.options.length, 3);
    assert.equal(question.focusItemIds?.length, 1);
  }
});

test('provides one unique audio source for every infinitive and example', () => {
  const audioSources = generatedEnglishAudioSources.filter((source) =>
    source.key.startsWith('essential-verbs-1-'),
  );

  assert.equal(audioSources.length, 40);
  assert.equal(new Set(audioSources.map((source) => source.key)).size, 40);
});

test('registers Essential Verbs I as the first Level 2 lesson', () => {
  const everydayActions = getCourseById('everyday-actions');

  assert.equal(everydayActions?.units[0]?.lessonIds[0], essentialVerbsOneLesson.id);
  assert.equal(getLessonById(essentialVerbsOneLesson.id), essentialVerbsOneLesson);
  assert.equal(getCourseLessonIds().at(-1), essentialVerbsOneLesson.id);
});
