import assert from 'node:assert/strict';
import test from 'node:test';

import { generatedEnglishAudioSources } from '../src/data/audio/english-audio-catalog.ts';
import { kitchenBasicsLesson } from '../src/data/lessons/kitchen-basics.ts';

const vocabularyActivities = kitchenBasicsLesson.activities.filter(
  (activity) => activity.type === 'vocabulary-introduction',
);
const exampleActivities = kitchenBasicsLesson.activities.filter(
  (activity) => activity.type === 'example-sentence',
);
const questions = kitchenBasicsLesson.activities.filter(
  (activity) => activity.type === 'multiple-choice',
);

test('contains all 12 required kitchen words with Romanian translations', () => {
  assert.deepEqual(
    vocabularyActivities.map((activity) => [activity.content.english, activity.content.romanian]),
    [
      ['fridge', 'frigider'],
      ['stove', 'aragaz'],
      ['oven', 'cuptor'],
      ['sink', 'chiuvetă'],
      ['table', 'masă'],
      ['chair', 'scaun'],
      ['plate', 'farfurie'],
      ['bowl', 'castron'],
      ['cup', 'cană'],
      ['glass', 'pahar'],
      ['spoon', 'lingură'],
      ['fork', 'furculiță'],
    ],
  );
});

test('provides one translated example for every vocabulary item', () => {
  assert.equal(exampleActivities.length, vocabularyActivities.length);

  for (const vocabulary of vocabularyActivities) {
    const example = exampleActivities.find((activity) =>
      activity.focusItemIds?.includes(vocabulary.vocabularyId),
    );

    assert.ok(example, `Missing example for ${vocabulary.vocabularyId}`);
    assert.ok(example.sentence.english);
    assert.ok(example.sentence.romanian);
    assert.equal(vocabulary.audio?.locale, 'en-US');
    assert.equal(vocabulary.audio?.text, vocabulary.content.english);
    assert.equal(example.sentence.audio?.locale, 'en-US');
    assert.equal(example.sentence.audio?.text, example.sentence.english);
  }
});

test('provides one unique generated recording source for every word and example', () => {
  const kitchenAudioSources = generatedEnglishAudioSources.filter((source) =>
    source.key.startsWith('kitchen-'),
  );

  assert.equal(kitchenAudioSources.length, 24);
  assert.equal(new Set(kitchenAudioSources.map((source) => source.key)).size, 24);
});

test('places two valid recall questions after every group of three words', () => {
  assert.equal(questions.length, 8);

  for (let groupIndex = 0; groupIndex < 4; groupIndex += 1) {
    const groupActivities = kitchenBasicsLesson.activities.slice(groupIndex * 8, groupIndex * 8 + 8);

    assert.deepEqual(
      groupActivities.map((activity) => activity.type),
      [
        'vocabulary-introduction',
        'example-sentence',
        'vocabulary-introduction',
        'example-sentence',
        'vocabulary-introduction',
        'example-sentence',
        'multiple-choice',
        'multiple-choice',
      ],
    );
  }

  for (const question of questions) {
    assert.ok(question.options.some((option) => option.id === question.correctOptionId));
  }

  const fillIn = kitchenBasicsLesson.activities.find(
    (activity) => activity.type === 'fill-in-the-blank',
  );
  assert.ok(fillIn);
  assert.equal(fillIn.completedSentence, 'The milk is in the fridge.');
  assert.deepEqual(fillIn.focusItemIds, ['fridge']);
  assert.equal(kitchenBasicsLesson.activities.length, 33);
});
