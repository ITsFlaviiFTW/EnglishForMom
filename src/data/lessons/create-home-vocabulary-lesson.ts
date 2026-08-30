import type {
  AudioSource,
  ExampleSentenceActivity,
  FillInTheBlankActivity,
  LearningText,
  Lesson,
  MultipleChoiceActivity,
  VocabularyIntroductionActivity,
} from '@/types';

export type HomeVocabularyItem = {
  id: string;
  word: LearningText;
  example: LearningText;
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
  prerequisiteLessonIds?: readonly string[];
  audioKeyPrefix: string;
  groups: readonly HomeVocabularyGroup[];
  practiceActivities?: readonly FillInTheBlankActivity[];
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
    prerequisiteLessonIds: definition.prerequisiteLessonIds,
    activities: [
      ...definition.groups.flatMap((group) => [
        ...group.items.flatMap((item) => createWordActivities(item, audioByItemId.get(item.id)!)),
        ...group.recall.map((recall) => createRecallActivity(recall, itemsById)),
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
): readonly [VocabularyIntroductionActivity, ExampleSentenceActivity] {
  return [
    {
      id: `introduce-${item.id}`,
      type: 'vocabulary-introduction',
      instructionRomanian: 'Privește, ascultă și repetă cuvântul în engleză.',
      vocabularyId: item.id,
      content: item.word,
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
): MultipleChoiceActivity {
  const answer = getItem(recall.answerItemId, itemsById);
  const englishToRomanian = recall.direction === 'english-to-romanian';

  return {
    id: recall.id,
    type: 'multiple-choice',
    instructionRomanian: 'Alege răspunsul corect.',
    prompt: englishToRomanian
      ? `Ce înseamnă „${answer.word.english}”?`
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
