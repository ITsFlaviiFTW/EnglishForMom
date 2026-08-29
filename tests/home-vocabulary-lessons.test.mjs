import assert from 'node:assert/strict';
import test from 'node:test';

import { generatedEnglishAudioSources } from '../src/data/audio/english-audio-catalog.ts';
import { getCourseLessonIds } from '../src/data/courses/course-catalog.ts';
import { bathroomBasicsLesson } from '../src/data/lessons/bathroom-basics.ts';
import { bedroomBasicsLesson } from '../src/data/lessons/bedroom-basics.ts';
import { cleaningBasicsLesson } from '../src/data/lessons/cleaning-basics.ts';
import { getLessonById } from '../src/data/lessons/lesson-catalog.ts';
import { laundryBasicsLesson } from '../src/data/lessons/laundry-basics.ts';
import { livingRoomBasicsLesson } from '../src/data/lessons/living-room-basics.ts';

const lessonExpectations = [
  {
    lesson: bathroomBasicsLesson,
    audioPrefix: 'bathroom-',
    words: [
      ['shower', 'duș'],
      ['toilet', 'toaletă'],
      ['sink', 'chiuvetă'],
      ['mirror', 'oglindă'],
      ['towel', 'prosop'],
      ['soap', 'săpun'],
      ['toothbrush', 'periuță de dinți'],
      ['toothpaste', 'pastă de dinți'],
      ['shampoo', 'șampon'],
      ['comb', 'pieptene'],
      ['hair dryer', 'uscător de păr'],
      ['toilet paper', 'hârtie igienică'],
      ['water', 'apă'],
      ['door', 'ușă'],
    ],
  },
  {
    lesson: bedroomBasicsLesson,
    audioPrefix: 'bedroom-',
    words: [
      ['bed', 'pat'],
      ['pillow', 'pernă'],
      ['blanket', 'pătură'],
      ['sheet', 'cearșaf'],
      ['closet', 'dulap'],
      ['clothes', 'haine'],
      ['shirt', 'cămașă'],
      ['pants', 'pantaloni'],
      ['socks', 'șosete'],
      ['shoes', 'pantofi'],
      ['lamp', 'lampă'],
      ['window', 'fereastră'],
      ['door', 'ușă'],
      ['phone', 'telefon'],
    ],
  },
  {
    lesson: livingRoomBasicsLesson,
    audioPrefix: 'living-room-',
    words: [
      ['sofa', 'canapea'],
      ['armchair', 'fotoliu'],
      ['coffee table', 'măsuță de cafea'],
      ['TV', 'televizor'],
      ['remote control', 'telecomandă'],
      ['rug', 'covor'],
      ['curtains', 'perdele'],
      ['lamp', 'lampă'],
      ['window', 'fereastră'],
      ['door', 'ușă'],
      ['shelf', 'raft'],
      ['book', 'carte'],
      ['picture', 'tablou'],
      ['clock', 'ceas'],
    ],
  },
  {
    lesson: laundryBasicsLesson,
    audioPrefix: 'laundry-',
    words: [
      ['washing machine', 'mașină de spălat'],
      ['dryer', 'uscător de rufe'],
      ['laundry basket', 'coș de rufe'],
      ['detergent', 'detergent'],
      ['fabric softener', 'balsam de rufe'],
      ['dirty clothes', 'haine murdare'],
      ['clean clothes', 'haine curate'],
      ['shirt', 'cămașă'],
      ['pants', 'pantaloni'],
      ['socks', 'șosete'],
      ['towel', 'prosop'],
      ['sheet', 'cearșaf'],
      ['wash', 'a spăla'],
      ['dry', 'a usca'],
    ],
  },
  {
    lesson: cleaningBasicsLesson,
    audioPrefix: 'cleaning-',
    words: [
      ['vacuum cleaner', 'aspirator'],
      ['broom', 'mătură'],
      ['mop', 'mop'],
      ['bucket', 'găleată'],
      ['sponge', 'burete'],
      ['cloth', 'lavetă'],
      ['cleaning spray', 'spray de curățat'],
      ['gloves', 'mănuși'],
      ['trash can', 'coș de gunoi'],
      ['trash bag', 'sac de gunoi'],
      ['dust', 'praf'],
      ['floor', 'podea'],
      ['clean', 'a curăța'],
      ['dirty', 'murdar'],
    ],
  },
];

for (const { lesson, audioPrefix, words } of lessonExpectations) {
  test(`${lesson.title.english} contains 14 translated vocabulary items`, () => {
    const vocabulary = lesson.activities.filter(
      (activity) => activity.type === 'vocabulary-introduction',
    );

    assert.deepEqual(
      vocabulary.map((activity) => [activity.content.english, activity.content.romanian]),
      words,
    );
  });

  test(`${lesson.title.english} includes translated examples and audio for every item`, () => {
    const vocabulary = lesson.activities.filter(
      (activity) => activity.type === 'vocabulary-introduction',
    );
    const examples = lesson.activities.filter((activity) => activity.type === 'example-sentence');
    const audioSources = generatedEnglishAudioSources.filter((source) =>
      source.key.startsWith(audioPrefix),
    );

    assert.equal(examples.length, vocabulary.length);
    assert.equal(audioSources.length, vocabulary.length * 2);

    for (const item of vocabulary) {
      const example = examples.find((activity) =>
        activity.focusItemIds?.includes(item.vocabularyId),
      );
      assert.ok(example, `Missing example for ${item.vocabularyId}`);
      assert.ok(example.sentence.english);
      assert.ok(example.sentence.romanian);
      assert.equal(item.audio?.text, item.content.english);
      assert.equal(example.sentence.audio?.text, example.sentence.english);
    }
  });

  test(`${lesson.title.english} places bilingual recall after each vocabulary group`, () => {
    const questions = lesson.activities.filter((activity) => activity.type === 'multiple-choice');

    assert.equal(lesson.activities.length, 38);
    assert.equal(questions.length, 10);
    assert.equal(questions.filter((question) => question.prompt.startsWith('Ce înseamnă')).length, 5);
    assert.equal(
      questions.filter((question) => question.prompt.startsWith('Care este cuvântul')).length,
      5,
    );

    for (const question of questions) {
      assert.ok(question.options.some((option) => option.id === question.correctOptionId));
      assert.deepEqual(question.focusItemIds, [question.correctOptionId]);
    }
  });
}

test('registers all production lessons in course order', () => {
  const lessonIds = getCourseLessonIds();

  assert.deepEqual(lessonIds, [
    'level-1-kitchen-basics',
    'level-1-bathroom-basics',
    'level-1-bedroom-basics',
    'level-1-living-room-basics',
    'level-1-laundry-basics',
    'level-1-cleaning-basics',
  ]);
  for (const lessonId of lessonIds) {
    assert.equal(getLessonById(lessonId)?.id, lessonId);
  }
});

test('keeps every generated audio key unique', () => {
  assert.equal(
    new Set(generatedEnglishAudioSources.map((source) => source.key)).size,
    generatedEnglishAudioSources.length,
  );
});
