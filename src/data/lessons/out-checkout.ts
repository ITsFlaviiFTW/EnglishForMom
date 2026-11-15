import { createDialogueQuestion } from './create-dialogue.ts';
import { createHomeVocabularyLesson } from './create-home-vocabulary-lesson.ts';

const AUDIO_PREFIX = 'checkout';

const dialogues = [
  createDialogueQuestion(AUDIO_PREFIX, {
    id: 'find-everything',
    staffVoice: 'female',
    lines: [
      {
        speaker: 'staff',
        english: 'Hi there! Did you find everything okay today?',
        romanian: 'Bună! Ați găsit tot ce căutați azi?',
      },
      { speaker: 'customer', english: 'Yes, thank you.', romanian: 'Da, mulțumesc.' },
    ],
    promptRomanian: 'Ce a întrebat casiera?',
    options: [
      { id: 'bag', text: 'Dacă ai nevoie de o pungă' },
      { id: 'find', text: 'Dacă ai găsit tot ce căutai' },
      { id: 'card', text: 'Dacă ai card de puncte' },
    ],
    correctOptionId: 'find',
    focusItemIds: ['find-everything'],
    explanationRomanian: '„Did you find everything okay?” = „Ați găsit tot ce căutați?”.',
  }),
  createDialogueQuestion(AUDIO_PREFIX, {
    id: 'bag-ten-cents',
    staffVoice: 'male',
    lines: [
      {
        speaker: 'staff',
        english: "Do you need a bag today? They're ten cents each.",
        romanian: 'Aveți nevoie de o pungă azi? Costă zece cenți bucata.',
      },
      {
        speaker: 'customer',
        english: 'No, thank you. I have a bag.',
        romanian: 'Nu, mulțumesc. Am o sacoșă.',
      },
    ],
    promptRomanian: 'Cât costă o pungă?',
    options: [
      { id: 'ten-cents', text: '10 cenți' },
      { id: 'one-dollar', text: '1 dolar' },
      { id: 'free', text: 'Este gratuită' },
    ],
    correctOptionId: 'ten-cents',
    focusItemIds: ['need-bag'],
    explanationRomanian: '„Ten cents each” = zece cenți bucata.',
  }),
  createDialogueQuestion(AUDIO_PREFIX, {
    id: 'total-debit-tap',
    staffVoice: 'female',
    lines: [
      {
        speaker: 'staff',
        english: 'Your total is twenty-three fifteen. Debit or credit?',
        romanian: 'Totalul este 23,15 de dolari. Debit sau credit?',
      },
      { speaker: 'customer', english: 'Debit, please.', romanian: 'Debit, vă rog.' },
      {
        speaker: 'staff',
        english: "Perfect. Go ahead and tap whenever you're ready.",
        romanian: 'Perfect. Apropiați cardul când sunteți gata.',
      },
    ],
    promptRomanian: 'Cât ai de plătit?',
    options: [
      { id: 'thirty-three-fifty', text: '$33.50' },
      { id: 'twenty-fifteen', text: '$20.15' },
      { id: 'twenty-three-fifteen', text: '$23.15' },
    ],
    correctOptionId: 'twenty-three-fifteen',
    focusItemIds: ['debit-credit', 'tap'],
    explanationRomanian:
      '„Twenty-three fifteen” = $23.15. „Go ahead and tap” = apropiați cardul de aparat.',
  }),
  createDialogueQuestion(AUDIO_PREFIX, {
    id: 'have-a-good-one',
    staffVoice: 'male',
    lines: [
      {
        speaker: 'staff',
        english: "Here's your receipt. Have a good one!",
        romanian: 'Poftiți bonul. O zi bună!',
      },
      { speaker: 'customer', english: 'Thanks, you too!', romanian: 'Mulțumesc, la fel!' },
    ],
    promptRomanian: 'Ce ți-a urat casierul la final?',
    options: [
      { id: 'good-day', text: 'O zi bună' },
      { id: 'enjoy-meal', text: 'Poftă bună' },
      { id: 'see-you', text: 'Pe mâine' },
    ],
    correctOptionId: 'good-day',
    focusItemIds: ['good-day'],
    explanationRomanian: '„Have a good one!” înseamnă la fel ca „Have a good day!”: o zi bună.',
  }),
];

const checkout = createHomeVocabularyLesson({
  id: 'out-4-checkout',
  title: {
    english: 'At the Checkout',
    romanian: 'La casă',
  },
  descriptionRomanian: 'Ce te întreabă casierul și ce îi răspunzi, de la salut până la bon.',
  estimatedMinutes: 18,
  audioKeyPrefix: AUDIO_PREFIX,
  phrases: true,
  groups: [
    {
      items: [
        {
          id: 'how-are-you',
          word: { english: 'Hi, how are you?', romanian: 'Bună, ce mai faceți?' },
          example: { english: 'Good, thanks. And you?', romanian: 'Bine, mulțumesc. Dumneavoastră?' },
          note: 'Casierii întreabă asta aproape mereu. E doar un salut: un răspuns scurt e suficient.',
        },
        {
          id: 'find-everything',
          word: {
            english: 'Did you find everything okay?',
            romanian: 'Ați găsit tot ce căutați?',
          },
          example: { english: 'Yes, I did. Thank you.', romanian: 'Da, am găsit. Mulțumesc.' },
        },
        {
          id: 'need-bag',
          word: { english: 'Do you need a bag?', romanian: 'Aveți nevoie de o pungă?' },
          example: {
            english: 'No, thank you. I have a bag.',
            romanian: 'Nu, mulțumesc. Am o sacoșă.',
          },
          note: 'În Canada, pungile se plătesc de obicei. E bine să ai o sacoșă de acasă.',
        },
        {
          id: 'points-card',
          word: { english: 'Do you have a points card?', romanian: 'Aveți card de puncte?' },
          example: { english: "No, I don't. Thank you.", romanian: 'Nu, nu am. Mulțumesc.' },
          note: 'Multe magazine au carduri de fidelitate (de exemplu PC Optimum). Dacă nu ai, spui „No”.',
        },
      ],
      recall: [
        {
          id: 'recall-bag-ro',
          direction: 'english-to-romanian',
          answerItemId: 'need-bag',
          optionItemIds: ['points-card', 'need-bag', 'find-everything'],
        },
        {
          id: 'recall-find-en',
          direction: 'romanian-to-english',
          answerItemId: 'find-everything',
          optionItemIds: ['find-everything', 'how-are-you', 'need-bag'],
        },
      ],
    },
    {
      items: [
        {
          id: 'debit-credit',
          word: { english: 'Debit or credit?', romanian: 'Debit sau credit?' },
          example: { english: 'Debit, please.', romanian: 'Debit, vă rog.' },
          note: 'Debit = cardul de la bancă, cu banii tăi. Credit = cardul de credit.',
        },
        {
          id: 'tap',
          word: { english: 'You can tap your card.', romanian: 'Puteți apropia cardul.' },
          example: {
            english: 'Tap your card here, please.',
            romanian: 'Apropiați cardul aici, vă rog.',
          },
          note: '„Tap” = apropii cardul de aparat. „Insert” = îl introduci în aparat și scrii codul PIN.',
        },
        {
          id: 'receipt',
          word: { english: 'Do you want your receipt?', romanian: 'Vreți bonul?' },
          example: { english: "Here's your receipt.", romanian: 'Poftiți bonul.' },
        },
        {
          id: 'good-day',
          word: { english: 'Have a good day!', romanian: 'O zi bună!' },
          example: { english: 'Thanks, you too!', romanian: 'Mulțumesc, la fel!' },
          note: 'Răspunsul obișnuit este „You too!” (La fel!).',
        },
      ],
      recall: [
        {
          id: 'recall-tap-ro',
          direction: 'english-to-romanian',
          answerItemId: 'tap',
          optionItemIds: ['receipt', 'debit-credit', 'tap'],
        },
        {
          id: 'recall-receipt-en',
          direction: 'romanian-to-english',
          answerItemId: 'receipt',
          optionItemIds: ['good-day', 'receipt', 'tap'],
        },
      ],
    },
  ],
  practiceActivities: [
    {
      id: 'fill-checkout-day',
      type: 'fill-in-the-blank',
      instructionRomanian: 'Alege cuvântul care completează propoziția.',
      sentence: 'Have a good ___!',
      completedSentence: 'Have a good day!',
      translationRomanian: 'O zi bună!',
      options: [
        { id: 'day', text: 'day' },
        { id: 'bag', text: 'bag' },
        { id: 'card', text: 'card' },
      ],
      acceptedAnswers: ['day'],
      focusItemIds: ['good-day'],
    },
    ...dialogues.map(({ activity }) => activity),
  ],
});

export const checkoutLesson = checkout.lesson;
export const checkoutAudioSources = checkout.audioSources;
export const checkoutDialogues = dialogues.map(({ source }) => source);
