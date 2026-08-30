import { createHomeVocabularyLesson } from './create-home-vocabulary-lesson.ts';

const laundryBasics = createHomeVocabularyLesson({
  id: 'level-1-laundry-basics',
  title: {
    english: 'Laundry Basics',
    romanian: 'Spălatul rufelor: cuvinte de bază',
  },
  descriptionRomanian: 'Învață 14 cuvinte și expresii pentru spălatul și uscarea rufelor.',
  estimatedMinutes: 18,
  prerequisiteLessonIds: ['level-1-living-room-basics'],
  audioKeyPrefix: 'laundry',
  groups: [
    {
      items: [
        {
          id: 'washing-machine',
          word: { english: 'washing machine', romanian: 'mașină de spălat' },
          example: {
            english: 'The clothes are in the washing machine.',
            romanian: 'Hainele sunt în mașina de spălat.',
          },
        },
        {
          id: 'clothes-dryer',
          word: { english: 'dryer', romanian: 'uscător de rufe' },
          example: {
            english: 'The towels are in the dryer.',
            romanian: 'Prosoapele sunt în uscătorul de rufe.',
          },
        },
        {
          id: 'laundry-basket',
          word: { english: 'laundry basket', romanian: 'coș de rufe' },
          example: {
            english: 'Put the dirty clothes in the laundry basket.',
            romanian: 'Pune hainele murdare în coșul de rufe.',
          },
        },
      ],
      recall: [
        {
          id: 'recall-washing-machine-ro',
          direction: 'english-to-romanian',
          answerItemId: 'washing-machine',
          optionItemIds: ['laundry-basket', 'clothes-dryer', 'washing-machine'],
        },
        {
          id: 'recall-laundry-basket-en',
          direction: 'romanian-to-english',
          answerItemId: 'laundry-basket',
          optionItemIds: ['washing-machine', 'laundry-basket', 'clothes-dryer'],
        },
      ],
    },
    {
      items: [
        {
          id: 'detergent',
          word: { english: 'detergent', romanian: 'detergent' },
          example: {
            english: 'Put the detergent in the washing machine.',
            romanian: 'Pune detergentul în mașina de spălat.',
          },
        },
        {
          id: 'fabric-softener',
          word: { english: 'fabric softener', romanian: 'balsam de rufe' },
          example: {
            english: 'The fabric softener is next to the detergent.',
            romanian: 'Balsamul de rufe este lângă detergent.',
          },
        },
        {
          id: 'dirty-clothes',
          word: { english: 'dirty clothes', romanian: 'haine murdare' },
          example: {
            english: 'The dirty clothes are in the basket.',
            romanian: 'Hainele murdare sunt în coș.',
          },
        },
      ],
      recall: [
        {
          id: 'recall-fabric-softener-ro',
          direction: 'english-to-romanian',
          answerItemId: 'fabric-softener',
          optionItemIds: ['detergent', 'dirty-clothes', 'fabric-softener'],
        },
        {
          id: 'recall-dirty-clothes-en',
          direction: 'romanian-to-english',
          answerItemId: 'dirty-clothes',
          optionItemIds: ['fabric-softener', 'dirty-clothes', 'detergent'],
        },
      ],
    },
    {
      items: [
        {
          id: 'clean-clothes',
          word: { english: 'clean clothes', romanian: 'haine curate' },
          example: {
            english: 'The clean clothes are on the bed.',
            romanian: 'Hainele curate sunt pe pat.',
          },
        },
        {
          id: 'shirt',
          word: { english: 'shirt', romanian: 'cămașă' },
          example: {
            english: 'Wash the shirt with the pants.',
            romanian: 'Spală cămașa împreună cu pantalonii.',
          },
        },
        {
          id: 'pants',
          word: { english: 'pants', romanian: 'pantaloni' },
          example: {
            english: 'The pants are in the washing machine.',
            romanian: 'Pantalonii sunt în mașina de spălat.',
          },
        },
      ],
      recall: [
        {
          id: 'recall-clean-clothes-ro',
          direction: 'english-to-romanian',
          answerItemId: 'clean-clothes',
          optionItemIds: ['pants', 'clean-clothes', 'shirt'],
        },
        {
          id: 'recall-shirt-en',
          direction: 'romanian-to-english',
          answerItemId: 'shirt',
          optionItemIds: ['clean-clothes', 'pants', 'shirt'],
        },
      ],
    },
    {
      items: [
        {
          id: 'socks',
          word: { english: 'socks', romanian: 'șosete' },
          example: {
            english: 'The socks are in the laundry basket.',
            romanian: 'Șosetele sunt în coșul de rufe.',
          },
        },
        {
          id: 'towel',
          word: { english: 'towel', romanian: 'prosop' },
          example: {
            english: 'Dry the towel in the dryer.',
            romanian: 'Usucă prosopul în uscătorul de rufe.',
          },
        },
        {
          id: 'sheet',
          word: { english: 'sheet', romanian: 'cearșaf' },
          example: { english: 'The sheet is clean.', romanian: 'Cearșaful este curat.' },
        },
      ],
      recall: [
        {
          id: 'recall-towel-ro',
          direction: 'english-to-romanian',
          answerItemId: 'towel',
          optionItemIds: ['sheet', 'socks', 'towel'],
        },
        {
          id: 'recall-socks-en',
          direction: 'romanian-to-english',
          answerItemId: 'socks',
          optionItemIds: ['towel', 'socks', 'sheet'],
        },
      ],
    },
    {
      items: [
        {
          id: 'wash',
          word: { english: 'wash', romanian: 'a spăla' },
          example: { english: 'Wash the clothes.', romanian: 'Spală hainele.' },
        },
        {
          id: 'dry',
          word: { english: 'dry', romanian: 'a usca' },
          example: { english: 'Dry the clothes.', romanian: 'Usucă hainele.' },
        },
      ],
      recall: [
        {
          id: 'recall-wash-ro',
          direction: 'english-to-romanian',
          answerItemId: 'wash',
          optionItemIds: ['dry', 'wash', 'clean-clothes'],
        },
        {
          id: 'recall-dry-en',
          direction: 'romanian-to-english',
          answerItemId: 'dry',
          optionItemIds: ['wash', 'dirty-clothes', 'dry'],
        },
      ],
    },
  ],
  practiceActivities: [
    {
      id: 'fill-laundry-basket',
      type: 'fill-in-the-blank',
      instructionRomanian: 'Alege cuvântul care completează propoziția.',
      sentence: 'Put the dirty clothes in the ___.',
      completedSentence: 'Put the dirty clothes in the laundry basket.',
      translationRomanian: 'Pune hainele murdare în coșul de rufe.',
      options: [
        { id: 'laundry-basket', text: 'laundry basket' },
        { id: 'dryer', text: 'dryer' },
        { id: 'closet', text: 'closet' },
      ],
      acceptedAnswers: ['laundry basket'],
      focusItemIds: ['laundry-basket'],
    },
  ],
});

export const laundryBasicsLesson = laundryBasics.lesson;
export const laundryBasicsAudioSources = laundryBasics.audioSources;
