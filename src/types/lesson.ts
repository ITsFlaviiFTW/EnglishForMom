export type ActivityId = string;
export type LessonId = string;

export type LearningText = {
  english: string;
  romanian: string;
};

export type AudioSource = {
  /** Stable key resolved by the audio service to a bundled recording or TTS request. */
  key: string;
  text: string;
  locale?: 'en-US' | 'en-GB';
  rate?: number;
};

export type ExampleSentence = LearningText & {
  audio?: AudioSource;
};

type ActivityBase = {
  id: ActivityId;
  instructionRomanian?: string;
};

export type VocabularyIntroductionActivity = ActivityBase & {
  type: 'vocabulary-introduction';
  vocabularyId: string;
  content: LearningText;
  /** Short, useful forms shown beneath the main word without turning the activity into a grammar lecture. */
  forms?: readonly LearningText[];
  audio?: AudioSource;
  examples?: readonly ExampleSentence[];
};

export type PhraseIntroductionActivity = ActivityBase & {
  type: 'phrase-introduction';
  phraseId: string;
  content: LearningText;
  audio?: AudioSource;
  examples?: readonly ExampleSentence[];
};

export type ExampleSentenceActivity = ActivityBase & {
  type: 'example-sentence';
  sentence: ExampleSentence;
  focusItemIds?: readonly string[];
};

export type ChoiceOption = {
  id: string;
  text: string;
};

export type MultipleChoiceActivity = ActivityBase & {
  type: 'multiple-choice';
  prompt: string;
  promptLanguage: 'english' | 'romanian';
  options: readonly ChoiceOption[];
  correctOptionId: string;
  focusItemIds?: readonly string[];
  explanationRomanian?: string;
};

export type MatchingPair = {
  id: string;
  english: string;
  romanian: string;
};

export type MatchingActivity = ActivityBase & {
  type: 'matching';
  direction: 'english-to-romanian' | 'romanian-to-english' | 'mixed';
  pairs: readonly MatchingPair[];
};

export type SentenceToken = {
  id: string;
  text: string;
};

export type SentenceBuildingActivity = ActivityBase & {
  type: 'sentence-building';
  promptRomanian: string;
  tokens: readonly SentenceToken[];
  correctTokenOrder: readonly string[];
  completedSentence: string;
};

export type FillInTheBlankActivity = ActivityBase & {
  type: 'fill-in-the-blank';
  sentence: string;
  translationRomanian?: string;
  acceptedAnswers: readonly string[];
  audio?: AudioSource;
};

export type ListeningActivity = ActivityBase & {
  type: 'listening';
  audio: AudioSource;
  promptRomanian: string;
  options: readonly ChoiceOption[];
  correctOptionId: string;
  transcript?: string;
};

export type SpeakingActivity = ActivityBase & {
  type: 'speaking';
  target: LearningText;
  audio?: AudioSource;
  recommendedRepetitions?: number;
};

export type LessonActivity =
  | VocabularyIntroductionActivity
  | PhraseIntroductionActivity
  | ExampleSentenceActivity
  | MultipleChoiceActivity
  | MatchingActivity
  | SentenceBuildingActivity
  | FillInTheBlankActivity
  | ListeningActivity
  | SpeakingActivity;

export type Lesson = {
  id: LessonId;
  schemaVersion: 1;
  title: LearningText;
  descriptionRomanian?: string;
  estimatedMinutes: number;
  prerequisiteLessonIds?: readonly LessonId[];
  activities: readonly LessonActivity[];
};

export type ActivityResponse =
  | { type: 'acknowledged' }
  | { type: 'choice'; optionId: string }
  | { type: 'matching'; pairings: Readonly<Record<string, string>> }
  | { type: 'token-order'; tokenIds: readonly string[] }
  | { type: 'text'; value: string }
  | { type: 'speaking-completed'; repetitions: number };
