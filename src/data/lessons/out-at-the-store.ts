import { createDialogueQuestion } from './create-dialogue.ts';
import { createHomeVocabularyLesson } from './create-home-vocabulary-lesson.ts';

const AUDIO_PREFIX = 'store';

const dialogues = [
  createDialogueQuestion(AUDIO_PREFIX, {
    id: 'where-eggs',
    staffVoice: 'male',
    lines: [
      {
        speaker: 'customer',
        english: 'Excuse me, where can I find the eggs?',
        romanian: 'Scuzați-mă, unde găsesc ouăle?',
      },
      {
        speaker: 'staff',
        english: "The eggs? They're in aisle seven, next to the milk.",
        romanian: 'Ouăle? Sunt pe culoarul șapte, lângă lapte.',
      },
    ],
    promptRomanian: 'Unde sunt ouăle?',
    options: [
      { id: 'aisle-seven', text: 'Pe culoarul 7, lângă lapte' },
      { id: 'aisle-eleven', text: 'Pe culoarul 11, lângă pâine' },
      { id: 'outside', text: 'Afară, lângă cărucioare' },
    ],
    correctOptionId: 'aisle-seven',
    focusItemIds: ['where-find', 'aisle'],
    explanationRomanian: '„Aisle seven” înseamnă culoarul șapte. „Next to the milk” = lângă lapte.',
  }),
  createDialogueQuestion(AUDIO_PREFIX, {
    id: 'out-of-rice',
    staffVoice: 'female',
    lines: [
      { speaker: 'customer', english: 'Excuse me, do you have rice?', romanian: 'Scuzați-mă, aveți orez?' },
      {
        speaker: 'staff',
        english: "Sorry, we're out of rice today. Try again tomorrow.",
        romanian: 'Ne pare rău, nu mai avem orez azi. Încercați mâine.',
      },
    ],
    promptRomanian: 'Ce a răspuns vânzătoarea?',
    options: [
      { id: 'sale', text: 'Orezul este la reducere' },
      { id: 'aisle', text: 'Orezul este pe culoarul 2' },
      { id: 'out', text: 'Nu mai au orez azi' },
    ],
    correctOptionId: 'out',
    focusItemIds: ['do-you-have', 'out-of'],
    explanationRomanian: '„We\'re out of rice” înseamnă că nu mai au orez. „Tomorrow” = mâine.',
  }),
  createDialogueQuestion(AUDIO_PREFIX, {
    id: 'just-looking',
    staffVoice: 'male',
    lines: [
      {
        speaker: 'staff',
        english: 'Hi there! Can I help you find something?',
        romanian: 'Bună! Vă pot ajuta să găsiți ceva?',
      },
      {
        speaker: 'customer',
        english: "No, thank you. I'm just looking.",
        romanian: 'Nu, mulțumesc. Doar mă uit.',
      },
    ],
    promptRomanian: 'Ce a răspuns clienta?',
    options: [
      { id: 'looking', text: 'Că doar se uită' },
      { id: 'bread', text: 'Că vrea pâine' },
      { id: 'understand', text: 'Că nu înțelege' },
    ],
    correctOptionId: 'looking',
    focusItemIds: ['can-i-help', 'just-looking'],
    explanationRomanian: '„I\'m just looking” înseamnă „Doar mă uit”. Așa refuzi politicos ajutorul.',
  }),
];

const atTheStore = createHomeVocabularyLesson({
  id: 'out-3-at-the-store',
  title: {
    english: 'At the Store',
    romanian: 'În magazin',
  },
  descriptionRomanian: 'Cum întrebi unde găsești ceva și ce îți răspund vânzătorii.',
  estimatedMinutes: 16,
  audioKeyPrefix: AUDIO_PREFIX,
  phrases: true,
  groups: [
    {
      items: [
        {
          id: 'looking-for',
          word: { english: "I'm looking for bread.", romanian: 'Caut pâine.' },
          example: {
            english: "Excuse me, I'm looking for rice.",
            romanian: 'Scuzați-mă, caut orez.',
          },
        },
        {
          id: 'where-find',
          word: { english: 'Where can I find the eggs?', romanian: 'Unde găsesc ouăle?' },
          example: {
            english: 'Where can I find the coffee, please?',
            romanian: 'Unde găsesc cafeaua, vă rog?',
          },
        },
        {
          id: 'aisle',
          word: { english: 'aisle', romanian: 'culoar (între rafturi)' },
          example: {
            english: 'The eggs are in aisle five.',
            romanian: 'Ouăle sunt pe culoarul cinci.',
          },
          note: 'Se citește „ail”: litera „s” nu se aude. Numărul culoarului e scris sus, deasupra rafturilor.',
        },
        {
          id: 'do-you-have',
          word: { english: 'Do you have eggs?', romanian: 'Aveți ouă?' },
          example: {
            english: 'Do you have fresh bread today?',
            romanian: 'Aveți pâine proaspătă azi?',
          },
        },
      ],
      recall: [
        {
          id: 'recall-aisle-ro',
          direction: 'english-to-romanian',
          answerItemId: 'aisle',
          optionItemIds: ['aisle', 'do-you-have', 'looking-for'],
        },
        {
          id: 'recall-where-en',
          direction: 'romanian-to-english',
          answerItemId: 'where-find',
          optionItemIds: ['looking-for', 'where-find', 'do-you-have'],
        },
      ],
    },
    {
      items: [
        {
          id: 'out-of',
          word: { english: "We're out of milk.", romanian: 'Nu mai avem lapte.' },
          example: {
            english: "Sorry, we're out of eggs today.",
            romanian: 'Ne pare rău, nu mai avem ouă azi.',
          },
          note: '„Out of” înseamnă că produsul s-a terminat.',
        },
        {
          id: 'shopping-cart',
          word: { english: 'shopping cart', romanian: 'cărucior de cumpărături' },
          example: {
            english: 'The shopping carts are outside.',
            romanian: 'Cărucioarele sunt afară.',
          },
          note: 'La unele magazine, căruciorul se deblochează cu o monedă de 1 dolar, pe care o primești înapoi.',
        },
        {
          id: 'can-i-help',
          word: { english: 'Can I help you?', romanian: 'Vă pot ajuta?' },
          example: {
            english: 'Hi! Can I help you find something?',
            romanian: 'Bună! Vă pot ajuta să găsiți ceva?',
          },
        },
        {
          id: 'just-looking',
          word: { english: "I'm just looking, thanks.", romanian: 'Doar mă uit, mulțumesc.' },
          example: {
            english: "No, thank you. I'm just looking.",
            romanian: 'Nu, mulțumesc. Doar mă uit.',
          },
        },
      ],
      recall: [
        {
          id: 'recall-out-of-ro',
          direction: 'english-to-romanian',
          answerItemId: 'out-of',
          optionItemIds: ['can-i-help', 'out-of', 'just-looking'],
        },
        {
          id: 'recall-just-looking-en',
          direction: 'romanian-to-english',
          answerItemId: 'just-looking',
          optionItemIds: ['just-looking', 'can-i-help', 'out-of'],
        },
      ],
    },
  ],
  practiceActivities: [
    {
      id: 'fill-store-aisle',
      type: 'fill-in-the-blank',
      instructionRomanian: 'Alege cuvântul care completează propoziția.',
      sentence: 'The eggs are in ___ five.',
      completedSentence: 'The eggs are in aisle five.',
      translationRomanian: 'Ouăle sunt pe culoarul cinci.',
      options: [
        { id: 'aisle', text: 'aisle' },
        { id: 'cart', text: 'cart' },
        { id: 'bag', text: 'bag' },
      ],
      acceptedAnswers: ['aisle'],
      focusItemIds: ['aisle'],
    },
    ...dialogues.map(({ activity }) => activity),
  ],
});

export const atTheStoreLesson = atTheStore.lesson;
export const atTheStoreAudioSources = atTheStore.audioSources;
export const atTheStoreDialogues = dialogues.map(({ source }) => source);
