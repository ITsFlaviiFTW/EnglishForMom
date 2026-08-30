import { createHomeVocabularyLesson } from './create-home-vocabulary-lesson.ts';

const bathroomBasics = createHomeVocabularyLesson({
  id: 'level-1-bathroom-basics',
  title: {
    english: 'Bathroom Basics',
    romanian: 'Baia: cuvinte de bază',
  },
  descriptionRomanian: 'Învață 14 cuvinte utile pentru rutina zilnică din baie.',
  estimatedMinutes: 18,
  prerequisiteLessonIds: ['level-1-kitchen-basics'],
  audioKeyPrefix: 'bathroom',
  groups: [
    {
      items: [
        {
          id: 'shower',
          word: { english: 'shower', romanian: 'duș' },
          example: {
            english: 'I take a shower every morning.',
            romanian: 'Fac duș în fiecare dimineață.',
          },
        },
        {
          id: 'toilet',
          word: { english: 'toilet', romanian: 'toaletă' },
          example: {
            english: 'The toilet is next to the shower.',
            romanian: 'Toaleta este lângă duș.',
          },
        },
        {
          id: 'sink',
          word: { english: 'sink', romanian: 'chiuvetă' },
          example: {
            english: 'Wash your hands at the sink.',
            romanian: 'Spală-te pe mâini la chiuvetă.',
          },
        },
      ],
      recall: [
        {
          id: 'recall-shower-ro',
          direction: 'english-to-romanian',
          answerItemId: 'shower',
          optionItemIds: ['toilet', 'shower', 'sink'],
        },
        {
          id: 'recall-toilet-en',
          direction: 'romanian-to-english',
          answerItemId: 'toilet',
          optionItemIds: ['sink', 'toilet', 'shower'],
        },
      ],
    },
    {
      items: [
        {
          id: 'mirror',
          word: { english: 'mirror', romanian: 'oglindă' },
          example: {
            english: 'The mirror is above the sink.',
            romanian: 'Oglinda este deasupra chiuvetei.',
          },
        },
        {
          id: 'towel',
          word: { english: 'towel', romanian: 'prosop' },
          example: {
            english: 'The towel is next to the shower.',
            romanian: 'Prosopul este lângă duș.',
          },
        },
        {
          id: 'soap',
          word: { english: 'soap', romanian: 'săpun' },
          example: {
            english: 'The soap is by the sink.',
            romanian: 'Săpunul este lângă chiuvetă.',
          },
        },
      ],
      recall: [
        {
          id: 'recall-mirror-ro',
          direction: 'english-to-romanian',
          answerItemId: 'mirror',
          optionItemIds: ['soap', 'mirror', 'towel'],
        },
        {
          id: 'recall-towel-en',
          direction: 'romanian-to-english',
          answerItemId: 'towel',
          optionItemIds: ['mirror', 'soap', 'towel'],
        },
      ],
    },
    {
      items: [
        {
          id: 'toothbrush',
          word: { english: 'toothbrush', romanian: 'periuță de dinți' },
          example: {
            english: 'My toothbrush is by the sink.',
            romanian: 'Periuța mea de dinți este lângă chiuvetă.',
          },
        },
        {
          id: 'toothpaste',
          word: { english: 'toothpaste', romanian: 'pastă de dinți' },
          example: {
            english: 'Put toothpaste on the toothbrush.',
            romanian: 'Pune pastă de dinți pe periuța de dinți.',
          },
        },
        {
          id: 'shampoo',
          word: { english: 'shampoo', romanian: 'șampon' },
          example: {
            english: 'The shampoo is next to the soap.',
            romanian: 'Șamponul este lângă săpun.',
          },
        },
      ],
      recall: [
        {
          id: 'recall-toothpaste-ro',
          direction: 'english-to-romanian',
          answerItemId: 'toothpaste',
          optionItemIds: ['shampoo', 'toothbrush', 'toothpaste'],
        },
        {
          id: 'recall-toothbrush-en',
          direction: 'romanian-to-english',
          answerItemId: 'toothbrush',
          optionItemIds: ['toothpaste', 'toothbrush', 'shampoo'],
        },
      ],
    },
    {
      items: [
        {
          id: 'comb',
          word: { english: 'comb', romanian: 'pieptene' },
          example: {
            english: 'The comb is next to the mirror.',
            romanian: 'Pieptenele este lângă oglindă.',
          },
        },
        {
          id: 'hair-dryer',
          word: { english: 'hair dryer', romanian: 'uscător de păr' },
          example: {
            english: 'The hair dryer is under the sink.',
            romanian: 'Uscătorul de păr este sub chiuvetă.',
          },
        },
        {
          id: 'toilet-paper',
          word: { english: 'toilet paper', romanian: 'hârtie igienică' },
          example: {
            english: 'We need toilet paper.',
            romanian: 'Avem nevoie de hârtie igienică.',
          },
        },
      ],
      recall: [
        {
          id: 'recall-hair-dryer-ro',
          direction: 'english-to-romanian',
          answerItemId: 'hair-dryer',
          optionItemIds: ['comb', 'toilet-paper', 'hair-dryer'],
        },
        {
          id: 'recall-toilet-paper-en',
          direction: 'romanian-to-english',
          answerItemId: 'toilet-paper',
          optionItemIds: ['hair-dryer', 'comb', 'toilet-paper'],
        },
      ],
    },
    {
      items: [
        {
          id: 'water',
          word: { english: 'water', romanian: 'apă' },
          example: { english: 'The water is cold.', romanian: 'Apa este rece.' },
        },
        {
          id: 'door',
          word: { english: 'door', romanian: 'ușă' },
          example: {
            english: 'Close the bathroom door.',
            romanian: 'Închide ușa de la baie.',
          },
        },
      ],
      recall: [
        {
          id: 'recall-water-ro',
          direction: 'english-to-romanian',
          answerItemId: 'water',
          optionItemIds: ['water', 'door', 'soap'],
        },
        {
          id: 'recall-door-en',
          direction: 'romanian-to-english',
          answerItemId: 'door',
          optionItemIds: ['sink', 'water', 'door'],
        },
      ],
    },
  ],
  practiceActivities: [
    {
      id: 'fill-bathroom-sink',
      type: 'fill-in-the-blank',
      instructionRomanian: 'Alege cuvântul care completează propoziția.',
      sentence: 'The mirror is above the ___.',
      completedSentence: 'The mirror is above the sink.',
      translationRomanian: 'Oglinda este deasupra chiuvetei.',
      options: [
        { id: 'sink', text: 'sink' },
        { id: 'shower', text: 'shower' },
        { id: 'toilet', text: 'toilet' },
      ],
      acceptedAnswers: ['sink'],
      focusItemIds: ['sink'],
    },
  ],
});

export const bathroomBasicsLesson = bathroomBasics.lesson;
export const bathroomBasicsAudioSources = bathroomBasics.audioSources;
