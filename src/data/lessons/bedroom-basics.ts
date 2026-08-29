import { createHomeVocabularyLesson } from './create-home-vocabulary-lesson.ts';

const bedroomBasics = createHomeVocabularyLesson({
  id: 'level-1-bedroom-basics',
  title: {
    english: 'Bedroom Basics',
    romanian: 'Dormitorul: cuvinte de bază',
  },
  descriptionRomanian: 'Învață 14 cuvinte practice pentru dormitor și haine.',
  estimatedMinutes: 18,
  prerequisiteLessonIds: ['level-1-bathroom-basics'],
  audioKeyPrefix: 'bedroom',
  groups: [
    {
      items: [
        {
          id: 'bed',
          word: { english: 'bed', romanian: 'pat' },
          example: { english: 'The bed is in the bedroom.', romanian: 'Patul este în dormitor.' },
        },
        {
          id: 'pillow',
          word: { english: 'pillow', romanian: 'pernă' },
          example: { english: 'The pillow is on the bed.', romanian: 'Perna este pe pat.' },
        },
        {
          id: 'blanket',
          word: { english: 'blanket', romanian: 'pătură' },
          example: { english: 'The blanket is on the bed.', romanian: 'Pătura este pe pat.' },
        },
      ],
      recall: [
        {
          id: 'recall-pillow-ro',
          direction: 'english-to-romanian',
          answerItemId: 'pillow',
          optionItemIds: ['bed', 'blanket', 'pillow'],
        },
        {
          id: 'recall-blanket-en',
          direction: 'romanian-to-english',
          answerItemId: 'blanket',
          optionItemIds: ['pillow', 'bed', 'blanket'],
        },
      ],
    },
    {
      items: [
        {
          id: 'sheet',
          word: { english: 'sheet', romanian: 'cearșaf' },
          example: { english: 'The sheet is clean.', romanian: 'Cearșaful este curat.' },
        },
        {
          id: 'closet',
          word: { english: 'closet', romanian: 'dulap' },
          example: { english: 'The closet is next to the door.', romanian: 'Dulapul este lângă ușă.' },
        },
        {
          id: 'clothes',
          word: { english: 'clothes', romanian: 'haine' },
          example: { english: 'The clothes are in the closet.', romanian: 'Hainele sunt în dulap.' },
        },
      ],
      recall: [
        {
          id: 'recall-closet-ro',
          direction: 'english-to-romanian',
          answerItemId: 'closet',
          optionItemIds: ['clothes', 'sheet', 'closet'],
        },
        {
          id: 'recall-clothes-en',
          direction: 'romanian-to-english',
          answerItemId: 'clothes',
          optionItemIds: ['closet', 'clothes', 'sheet'],
        },
      ],
    },
    {
      items: [
        {
          id: 'shirt',
          word: { english: 'shirt', romanian: 'cămașă' },
          example: { english: 'The shirt is in the closet.', romanian: 'Cămașa este în dulap.' },
        },
        {
          id: 'pants',
          word: { english: 'pants', romanian: 'pantaloni' },
          example: { english: 'The pants are on the bed.', romanian: 'Pantalonii sunt pe pat.' },
        },
        {
          id: 'socks',
          word: { english: 'socks', romanian: 'șosete' },
          example: { english: 'The socks are under the chair.', romanian: 'Șosetele sunt sub scaun.' },
        },
      ],
      recall: [
        {
          id: 'recall-shirt-ro',
          direction: 'english-to-romanian',
          answerItemId: 'shirt',
          optionItemIds: ['pants', 'shirt', 'socks'],
        },
        {
          id: 'recall-socks-en',
          direction: 'romanian-to-english',
          answerItemId: 'socks',
          optionItemIds: ['shirt', 'socks', 'pants'],
        },
      ],
    },
    {
      items: [
        {
          id: 'shoes',
          word: { english: 'shoes', romanian: 'pantofi' },
          example: { english: 'The shoes are by the door.', romanian: 'Pantofii sunt lângă ușă.' },
        },
        {
          id: 'lamp',
          word: { english: 'lamp', romanian: 'lampă' },
          example: { english: 'The lamp is next to the bed.', romanian: 'Lampa este lângă pat.' },
        },
        {
          id: 'window',
          word: { english: 'window', romanian: 'fereastră' },
          example: { english: 'The window is open.', romanian: 'Fereastra este deschisă.' },
        },
      ],
      recall: [
        {
          id: 'recall-lamp-ro',
          direction: 'english-to-romanian',
          answerItemId: 'lamp',
          optionItemIds: ['window', 'shoes', 'lamp'],
        },
        {
          id: 'recall-window-en',
          direction: 'romanian-to-english',
          answerItemId: 'window',
          optionItemIds: ['lamp', 'window', 'shoes'],
        },
      ],
    },
    {
      items: [
        {
          id: 'door',
          word: { english: 'door', romanian: 'ușă' },
          example: {
            english: 'Close the bedroom door.',
            romanian: 'Închide ușa de la dormitor.',
          },
        },
        {
          id: 'phone',
          word: { english: 'phone', romanian: 'telefon' },
          example: {
            english: 'The phone is on the table next to the bed.',
            romanian: 'Telefonul este pe masa de lângă pat.',
          },
        },
      ],
      recall: [
        {
          id: 'recall-door-ro',
          direction: 'english-to-romanian',
          answerItemId: 'door',
          optionItemIds: ['phone', 'door', 'window'],
        },
        {
          id: 'recall-phone-en',
          direction: 'romanian-to-english',
          answerItemId: 'phone',
          optionItemIds: ['door', 'lamp', 'phone'],
        },
      ],
    },
  ],
});

export const bedroomBasicsLesson = bedroomBasics.lesson;
export const bedroomBasicsAudioSources = bedroomBasics.audioSources;
