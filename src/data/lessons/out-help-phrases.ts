import { createDialogueQuestion } from './create-dialogue.ts';
import { createHomeVocabularyLesson } from './create-home-vocabulary-lesson.ts';

const AUDIO_PREFIX = 'help';

const dialogues = [
  createDialogueQuestion(AUDIO_PREFIX, {
    id: 'help-find',
    staffVoice: 'female',
    lines: [
      {
        speaker: 'staff',
        english: 'Hi there! Can I help you find anything today?',
        romanian: 'Bună! Vă pot ajuta să găsiți ceva azi?',
      },
      { speaker: 'customer', english: 'Sorry? Slowly, please.', romanian: 'Poftim? Mai rar, vă rog.' },
      { speaker: 'staff', english: 'Of course. Can I help you?', romanian: 'Sigur. Vă pot ajuta?' },
    ],
    promptRomanian: 'Ce a întrebat vânzătoarea?',
    options: [
      { id: 'help', text: 'Dacă te poate ajuta' },
      { id: 'price', text: 'Cât costă ceva' },
      { id: 'bag', text: 'Dacă vrei o pungă' },
    ],
    correctOptionId: 'help',
    focusItemIds: ['sorry', 'slowly'],
    explanationRomanian:
      '„Can I help you?” înseamnă „Vă pot ajuta?”. Ai cerut politicos să vorbească mai rar, iar ea a repetat mai simplu.',
  }),
  createDialogueQuestion(AUDIO_PREFIX, {
    id: 'pharmacy-time',
    staffVoice: 'male',
    lines: [
      {
        speaker: 'staff',
        english: 'The pharmacy closes at eight thirty tonight.',
        romanian: 'Farmacia se închide la opt și jumătate diseară.',
      },
      {
        speaker: 'customer',
        english: 'Sorry, can you write it down, please?',
        romanian: 'Scuzați, puteți să-mi scrieți, vă rog?',
      },
      { speaker: 'staff', english: 'Sure. Eight thirty.', romanian: 'Sigur. Opt și jumătate.' },
    ],
    promptRomanian: 'La ce oră se închide farmacia?',
    options: [
      { id: 'eight-thirteen', text: '8:13' },
      { id: 'eight-thirty', text: '8:30 seara' },
      { id: 'three-thirty', text: '3:30' },
    ],
    correctOptionId: 'eight-thirty',
    focusItemIds: ['write-it-down'],
    explanationRomanian:
      '„Eight thirty” înseamnă 8:30. Când nu ești sigură de o oră sau de un preț, cere să ți-l scrie.',
  }),
];

const helpPhrases = createHomeVocabularyLesson({
  id: 'out-1-help-phrases',
  title: {
    english: "When You Don't Understand",
    romanian: 'Când nu înțelegi',
  },
  descriptionRomanian:
    'Expresii care te ajută când cineva vorbește prea repede sau nu înțelegi ce spune.',
  estimatedMinutes: 15,
  audioKeyPrefix: AUDIO_PREFIX,
  phrases: true,
  groups: [
    {
      items: [
        {
          id: 'excuse-me',
          word: { english: 'Excuse me.', romanian: 'Scuzați-mă.' },
          example: {
            english: 'Excuse me, where is the milk?',
            romanian: 'Scuzați-mă, unde este laptele?',
          },
          note: 'Așa începi politicos când vrei să întrebi ceva pe cineva, în magazin sau pe stradă.',
        },
        {
          id: 'sorry',
          word: { english: 'Sorry?', romanian: 'Poftim?' },
          example: {
            english: "Sorry? I didn't hear you.",
            romanian: 'Poftim? Nu v-am auzit.',
          },
          note: 'Spus ca întrebare, înseamnă „n-am auzit” sau „n-am înțeles”. În Canada se folosește foarte des.',
        },
        {
          id: 'repeat',
          word: { english: 'Can you repeat that, please?', romanian: 'Puteți repeta, vă rog?' },
          example: {
            english: "I don't understand. Can you repeat that, please?",
            romanian: 'Nu înțeleg. Puteți repeta, vă rog?',
          },
        },
        {
          id: 'slowly',
          word: { english: 'Slowly, please.', romanian: 'Mai rar, vă rog.' },
          example: {
            english: 'Can you speak slowly, please?',
            romanian: 'Puteți vorbi mai rar, vă rog?',
          },
          note: 'Nu e nepoliticos să ceri asta. Oamenii vor vorbi mai rar cu plăcere.',
        },
      ],
      recall: [
        {
          id: 'recall-sorry-ro',
          direction: 'english-to-romanian',
          answerItemId: 'sorry',
          optionItemIds: ['excuse-me', 'sorry', 'slowly'],
        },
        {
          id: 'recall-repeat-en',
          direction: 'romanian-to-english',
          answerItemId: 'repeat',
          optionItemIds: ['slowly', 'repeat', 'excuse-me'],
        },
      ],
    },
    {
      items: [
        {
          id: 'dont-understand',
          word: { english: "I don't understand.", romanian: 'Nu înțeleg.' },
          example: {
            english: "Sorry, I don't understand.",
            romanian: 'Îmi pare rău, nu înțeleg.',
          },
        },
        {
          id: 'little-english',
          word: { english: 'I speak a little English.', romanian: 'Vorbesc puțină engleză.' },
          example: {
            english: 'Sorry, I speak a little English.',
            romanian: 'Scuzați, vorbesc puțină engleză.',
          },
          note: 'Spune asta de la început. Oamenii vor vorbi mai simplu și mai rar.',
        },
        {
          id: 'write-it-down',
          word: {
            english: 'Can you write it down, please?',
            romanian: 'Puteți să-mi scrieți, vă rog?',
          },
          example: {
            english: 'The address? Can you write it down, please?',
            romanian: 'Adresa? Puteți să mi-o scrieți, vă rog?',
          },
          note: 'Foarte util pentru prețuri, adrese, nume și ore. Arată-le telefonul sau un carnețel.',
        },
        {
          id: 'thank-you',
          word: { english: 'Thank you very much.', romanian: 'Mulțumesc foarte mult.' },
          example: {
            english: 'Thank you very much for your help.',
            romanian: 'Vă mulțumesc foarte mult pentru ajutor.',
          },
        },
      ],
      recall: [
        {
          id: 'recall-write-ro',
          direction: 'english-to-romanian',
          answerItemId: 'write-it-down',
          optionItemIds: ['thank-you', 'dont-understand', 'write-it-down'],
        },
        {
          id: 'recall-little-en',
          direction: 'romanian-to-english',
          answerItemId: 'little-english',
          optionItemIds: ['little-english', 'dont-understand', 'thank-you'],
        },
      ],
    },
  ],
  practiceActivities: [
    {
      id: 'fill-help-repeat',
      type: 'fill-in-the-blank',
      instructionRomanian: 'Alege cuvântul care completează propoziția.',
      sentence: 'Can you ___ that, please?',
      completedSentence: 'Can you repeat that, please?',
      translationRomanian: 'Puteți repeta, vă rog?',
      options: [
        { id: 'repeat', text: 'repeat' },
        { id: 'write', text: 'write' },
        { id: 'speak', text: 'speak' },
      ],
      acceptedAnswers: ['repeat'],
      focusItemIds: ['repeat'],
    },
    ...dialogues.map(({ activity }) => activity),
  ],
});

export const helpPhrasesLesson = helpPhrases.lesson;
export const helpPhrasesAudioSources = helpPhrases.audioSources;
export const helpPhrasesDialogues = dialogues.map(({ source }) => source);
