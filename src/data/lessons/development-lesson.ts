import type { Lesson } from '@/types';

export const developmentLesson = {
  id: 'development-kitchen',
  schemaVersion: 1,
  title: {
    english: 'A word from the kitchen',
    romanian: 'Un cuvânt din bucătărie',
  },
  descriptionRomanian: 'O lecție scurtă pentru testarea sistemului de lecții.',
  estimatedMinutes: 2,
  activities: [
    {
      id: 'introduce-fridge',
      type: 'vocabulary-introduction',
      instructionRomanian: 'Privește și repetă cuvântul în engleză.',
      vocabularyId: 'fridge',
      content: {
        english: 'fridge',
        romanian: 'frigider',
      },
    },
    {
      id: 'example-fridge',
      type: 'example-sentence',
      instructionRomanian: 'Citește propoziția și observă unde apare cuvântul nou.',
      sentence: {
        english: 'The milk is in the fridge.',
        romanian: 'Laptele este în frigider.',
      },
      focusItemIds: ['fridge'],
    },
    {
      id: 'question-fridge',
      type: 'multiple-choice',
      instructionRomanian: 'Alege răspunsul corect.',
      prompt: 'Ce înseamnă „fridge”?',
      promptLanguage: 'romanian',
      options: [
        { id: 'table', text: 'masă' },
        { id: 'fridge', text: 'frigider' },
        { id: 'oven', text: 'cuptor' },
      ],
      correctOptionId: 'fridge',
      explanationRomanian: '„Fridge” înseamnă „frigider”.',
    },
  ],
} as const satisfies Lesson;
