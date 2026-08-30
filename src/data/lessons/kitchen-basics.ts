import type {
  ExampleSentenceActivity,
  FillInTheBlankActivity,
  LearningText,
  Lesson,
  MultipleChoiceActivity,
  VocabularyIntroductionActivity,
} from '@/types';
import { kitchenBasicsAudio } from '../audio/english-audio-catalog.ts';

type KitchenWord = {
  id: string;
  word: LearningText;
  example: LearningText;
};

const kitchenGroups = [
  [
    {
      id: 'fridge',
      word: { english: kitchenBasicsAudio.fridge.word.text, romanian: 'frigider' },
      example: {
        english: kitchenBasicsAudio.fridge.example.text,
        romanian: 'Laptele este în frigider.',
      },
    },
    {
      id: 'stove',
      word: { english: kitchenBasicsAudio.stove.word.text, romanian: 'aragaz' },
      example: {
        english: kitchenBasicsAudio.stove.example.text,
        romanian: 'Aragazul este lângă frigider.',
      },
    },
    {
      id: 'oven',
      word: { english: kitchenBasicsAudio.oven.word.text, romanian: 'cuptor' },
      example: {
        english: kitchenBasicsAudio.oven.example.text,
        romanian: 'Pâinea este în cuptor.',
      },
    },
  ],
  [
    {
      id: 'sink',
      word: { english: kitchenBasicsAudio.sink.word.text, romanian: 'chiuvetă' },
      example: {
        english: kitchenBasicsAudio.sink.example.text,
        romanian: 'Chiuveta este lângă aragaz.',
      },
    },
    {
      id: 'table',
      word: { english: kitchenBasicsAudio.table.word.text, romanian: 'masă' },
      example: {
        english: kitchenBasicsAudio.table.example.text,
        romanian: 'Masa este în bucătărie.',
      },
    },
    {
      id: 'chair',
      word: { english: kitchenBasicsAudio.chair.word.text, romanian: 'scaun' },
      example: {
        english: kitchenBasicsAudio.chair.example.text,
        romanian: 'Scaunul este lângă masă.',
      },
    },
  ],
  [
    {
      id: 'plate',
      word: { english: kitchenBasicsAudio.plate.word.text, romanian: 'farfurie' },
      example: {
        english: kitchenBasicsAudio.plate.example.text,
        romanian: 'Pune farfuria pe masă.',
      },
    },
    {
      id: 'bowl',
      word: { english: kitchenBasicsAudio.bowl.word.text, romanian: 'castron' },
      example: {
        english: kitchenBasicsAudio.bowl.example.text,
        romanian: 'Castronul este pe masă.',
      },
    },
    {
      id: 'cup',
      word: { english: kitchenBasicsAudio.cup.word.text, romanian: 'cană' },
      example: {
        english: kitchenBasicsAudio.cup.example.text,
        romanian: 'Cana este lângă castron.',
      },
    },
  ],
  [
    {
      id: 'glass',
      word: { english: kitchenBasicsAudio.glass.word.text, romanian: 'pahar' },
      example: {
        english: kitchenBasicsAudio.glass.example.text,
        romanian: 'Paharul este pe masă.',
      },
    },
    {
      id: 'spoon',
      word: { english: kitchenBasicsAudio.spoon.word.text, romanian: 'lingură' },
      example: {
        english: kitchenBasicsAudio.spoon.example.text,
        romanian: 'Lingura este în castron.',
      },
    },
    {
      id: 'fork',
      word: { english: kitchenBasicsAudio.fork.word.text, romanian: 'furculiță' },
      example: {
        english: kitchenBasicsAudio.fork.example.text,
        romanian: 'Furculița este lângă farfurie.',
      },
    },
  ],
] as const satisfies readonly (readonly KitchenWord[])[];

const recallQuestions = [
  [
    createQuestion({
      id: 'recall-stove-ro',
      prompt: 'Ce înseamnă „stove”?',
      options: [
        { id: 'fridge', text: 'frigider' },
        { id: 'stove', text: 'aragaz' },
        { id: 'oven', text: 'cuptor' },
      ],
      correctOptionId: 'stove',
      explanationRomanian: '„Stove” înseamnă „aragaz”.',
    }),
    createQuestion({
      id: 'recall-oven-en',
      prompt: 'Care este cuvântul în engleză pentru „cuptor”?',
      options: [
        { id: 'sink', text: 'sink' },
        { id: 'oven', text: 'oven' },
        { id: 'stove', text: 'stove' },
      ],
      correctOptionId: 'oven',
      explanationRomanian: '„Cuptor” se spune „oven” în engleză.',
    }),
  ],
  [
    createQuestion({
      id: 'recall-sink-ro',
      prompt: 'Ce înseamnă „sink”?',
      options: [
        { id: 'chair', text: 'scaun' },
        { id: 'table', text: 'masă' },
        { id: 'sink', text: 'chiuvetă' },
      ],
      correctOptionId: 'sink',
      explanationRomanian: '„Sink” înseamnă „chiuvetă”.',
    }),
    createQuestion({
      id: 'recall-chair-en',
      prompt: 'Care este cuvântul în engleză pentru „scaun”?',
      options: [
        { id: 'chair', text: 'chair' },
        { id: 'table', text: 'table' },
        { id: 'sink', text: 'sink' },
      ],
      correctOptionId: 'chair',
      explanationRomanian: '„Scaun” se spune „chair” în engleză.',
    }),
  ],
  [
    createQuestion({
      id: 'recall-bowl-ro',
      prompt: 'Ce înseamnă „bowl”?',
      options: [
        { id: 'plate', text: 'farfurie' },
        { id: 'cup', text: 'cană' },
        { id: 'bowl', text: 'castron' },
      ],
      correctOptionId: 'bowl',
      explanationRomanian: '„Bowl” înseamnă „castron”.',
    }),
    createQuestion({
      id: 'recall-cup-en',
      prompt: 'Care este cuvântul în engleză pentru „cană”?',
      options: [
        { id: 'plate', text: 'plate' },
        { id: 'cup', text: 'cup' },
        { id: 'bowl', text: 'bowl' },
      ],
      correctOptionId: 'cup',
      explanationRomanian: '„Cană” se spune „cup” în engleză.',
    }),
  ],
  [
    createQuestion({
      id: 'recall-spoon-ro',
      prompt: 'Ce înseamnă „spoon”?',
      options: [
        { id: 'glass', text: 'pahar' },
        { id: 'fork', text: 'furculiță' },
        { id: 'spoon', text: 'lingură' },
      ],
      correctOptionId: 'spoon',
      explanationRomanian: '„Spoon” înseamnă „lingură”.',
    }),
    createQuestion({
      id: 'recall-fork-en',
      prompt: 'Care este cuvântul în engleză pentru „furculiță”?',
      options: [
        { id: 'spoon', text: 'spoon' },
        { id: 'glass', text: 'glass' },
        { id: 'fork', text: 'fork' },
      ],
      correctOptionId: 'fork',
      explanationRomanian: '„Furculiță” se spune „fork” în engleză.',
    }),
  ],
] as const satisfies readonly (readonly MultipleChoiceActivity[])[];

export const kitchenBasicsLesson = {
  id: 'level-1-kitchen-basics',
  schemaVersion: 1,
  title: {
    english: 'Kitchen Basics',
    romanian: 'Bucătăria: cuvinte de bază',
  },
  descriptionRomanian: 'Învață 12 cuvinte utile pentru obiectele din bucătărie.',
  estimatedMinutes: 15,
  activities: [
    ...kitchenGroups.flatMap((group, index) => [
      ...group.flatMap(createWordActivities),
      ...recallQuestions[index],
    ]),
    {
      id: 'fill-fridge-sentence',
      type: 'fill-in-the-blank',
      instructionRomanian: 'Alege cuvântul care completează propoziția.',
      sentence: 'The milk is in the ___.',
      completedSentence: 'The milk is in the fridge.',
      translationRomanian: 'Laptele este în frigider.',
      options: [
        { id: 'fridge', text: 'fridge' },
        { id: 'oven', text: 'oven' },
        { id: 'sink', text: 'sink' },
      ],
      acceptedAnswers: ['fridge'],
      focusItemIds: ['fridge'],
    } satisfies FillInTheBlankActivity,
  ],
} satisfies Lesson;

function createWordActivities(
  item: KitchenWord,
): readonly [VocabularyIntroductionActivity, ExampleSentenceActivity] {
  const audio = kitchenBasicsAudio[item.id as keyof typeof kitchenBasicsAudio];

  return [
    {
      id: `introduce-${item.id}`,
      type: 'vocabulary-introduction',
      instructionRomanian: 'Privește și repetă cuvântul în engleză.',
      vocabularyId: item.id,
      content: item.word,
      audio: audio.word,
      examples: [{ ...item.example, audio: audio.example }],
    },
    {
      id: `example-${item.id}`,
      type: 'example-sentence',
      instructionRomanian: 'Citește exemplul practic.',
      sentence: { ...item.example, audio: audio.example },
      focusItemIds: [item.id],
    },
  ];
}

type QuestionInput = Omit<MultipleChoiceActivity, 'type' | 'instructionRomanian' | 'promptLanguage'>;

function createQuestion(question: QuestionInput): MultipleChoiceActivity {
  return {
    ...question,
    type: 'multiple-choice',
    instructionRomanian: 'Alege răspunsul corect.',
    promptLanguage: 'romanian',
    focusItemIds: question.focusItemIds ?? [question.correctOptionId],
  };
}
