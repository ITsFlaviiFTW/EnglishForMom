import type {
  AudioSource,
  ExampleSentenceActivity,
  LearningText,
  Lesson,
  LessonActivity,
  MultipleChoiceActivity,
  VocabularyIntroductionActivity,
} from '@/types';

export type HomeVocabularyItem = {
  id: string;
  word: LearningText;
  example: LearningText;
  /** Optional Romanian tip shown with the word (when you hear it, how to answer). */
  note?: string;
};

export type RecallPrompt = {
  id: string;
  direction: 'english-to-romanian' | 'romanian-to-english';
  answerItemId: string;
  optionItemIds: readonly string[];
};

export type HomeVocabularyGroup = {
  items: readonly HomeVocabularyItem[];
  recall: readonly RecallPrompt[];
};

type HomeVocabularyLessonDefinition = {
  id: string;
  title: LearningText;
  descriptionRomanian: string;
  estimatedMinutes: number;
  audioKeyPrefix: string;
  /** The items are whole phrases ("Can you repeat that, please?"), not single words. */
  phrases?: boolean;
  groups: readonly HomeVocabularyGroup[];
  /** Exercises after all the items: fill-in-the-blank, dialogue questions. */
  practiceActivities?: readonly LessonActivity[];
};

type HomeVocabularyLessonBundle = {
  lesson: Lesson;
  audioSources: readonly AudioSource[];
};

export function createHomeVocabularyLesson(
  definition: HomeVocabularyLessonDefinition,
): HomeVocabularyLessonBundle {
  const items = definition.groups.flatMap((group) => group.items);
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const audioByItemId = new Map(
    items.map((item) => [
      item.id,
      {
        word: createAudioSource(
          `${definition.audioKeyPrefix}-word-${item.id}`,
          item.word.english,
        ),
        example: createAudioSource(
          `${definition.audioKeyPrefix}-example-${item.id}`,
          item.example.english,
        ),
      },
    ]),
  );

  const lesson = {
    id: definition.id,
    schemaVersion: 1,
    title: definition.title,
    descriptionRomanian: definition.descriptionRomanian,
    estimatedMinutes: definition.estimatedMinutes,
    activities: [
      ...definition.groups.flatMap((group) => [
        ...group.items.flatMap((item) =>
          createWordActivities(item, audioByItemId.get(item.id)!, definition.phrases ?? false),
        ),
        ...group.recall.map((recall) =>
          createRecallActivity(recall, itemsById, definition.phrases ?? false),
        ),
      ]),
      ...(definition.practiceActivities ?? []),
    ],
  } satisfies Lesson;

  return {
    lesson,
    audioSources: [...audioByItemId.values()].flatMap(({ word, example }) => [word, example]),
  };
}

function createWordActivities(
  item: HomeVocabularyItem,
  audio: { word: AudioSource; example: AudioSource },
  phrases: boolean,
): readonly [VocabularyIntroductionActivity, ExampleSentenceActivity] {
  // In a phrase lesson, single words ("aisle", "cents") are still shown as words.
  const isPhrase = phrases && /\s/.test(item.word.english.trim());
  return [
    {
      id: `introduce-${item.id}`,
      type: 'vocabulary-introduction',
      instructionRomanian: isPhrase
        ? 'Privește, ascultă și repetă expresia în engleză.'
        : 'Privește, ascultă și repetă cuvântul în engleză.',
      vocabularyId: item.id,
      content: item.word,
      ...(isPhrase ? { isPhrase: true } : {}),
      ...(item.note ? { noteRomanian: item.note } : {}),
      audio: audio.word,
      examples: [{ ...item.example, audio: audio.example }],
    },
    {
      id: `example-${item.id}`,
      type: 'example-sentence',
      instructionRomanian: 'Ascultă și citește exemplul practic.',
      sentence: { ...item.example, audio: audio.example },
      focusItemIds: [item.id],
    },
  ];
}

function createRecallActivity(
  recall: RecallPrompt,
  itemsById: ReadonlyMap<string, HomeVocabularyItem>,
  phrases: boolean,
): MultipleChoiceActivity {
  const answer = getItem(recall.answerItemId, itemsById);
  const englishToRomanian = recall.direction === 'english-to-romanian';

  return {
    id: recall.id,
    type: 'multiple-choice',
    instructionRomanian: 'Alege răspunsul corect.',
    prompt: englishToRomanian
      ? `Ce înseamnă „${answer.word.english}”?`
      : phrases
        ? `Cum se spune în engleză „${answer.word.romanian}”?`
        : `Care este cuvântul în engleză pentru „${answer.word.romanian}”?`,
    promptLanguage: 'romanian',
    options: recall.optionItemIds.map((itemId) => {
      const item = getItem(itemId, itemsById);
      return {
        id: item.id,
        text: englishToRomanian ? item.word.romanian : item.word.english,
      };
    }),
    correctOptionId: answer.id,
    focusItemIds: [answer.id],
    explanationRomanian: englishToRomanian
      ? `„${answer.word.english}” înseamnă „${answer.word.romanian}”.`
      : `„${answer.word.romanian}” se spune „${answer.word.english}” în engleză.`,
  };
}

function getItem(
  itemId: string,
  itemsById: ReadonlyMap<string, HomeVocabularyItem>,
): HomeVocabularyItem {
  const item = itemsById.get(itemId);
  if (!item) {
    throw new Error(`Unknown vocabulary item in lesson data: ${itemId}`);
  }
  return item;
}

function createAudioSource(key: string, text: string): AudioSource {
  return {
    key,
    text,
    locale: 'en-US',
    rate: 0.85,
  };
}
