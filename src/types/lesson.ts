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

/** A word-by-word recording: each word spoken alone, with a pause after it. */
export type SpacedAudio = {
  /** Bundled recording (from `require`). */
  asset: number;
  /** The phrase split on spaces, punctuation kept, for display. */
  words: readonly string[];
  /** Second at which each word starts in the recording. */
  starts: readonly number[];
};

/**
 * A "Cu accent românesc" recording: a Romanian voice reads the phrase spelled
 * the Romanian way, then the normal English recording plays.
 */
export type AccentAudio = {
  /** Bundled recording (from `require`). */
  asset: number;
  /** The phrase written with Romanian letters, e.g. "Dă milc iz in dă frigi." */
  respelling: string;
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
  /** A whole phrase ("Can you repeat that, please?") rather than a single word. */
  isPhrase?: boolean;
  /** A short Romanian tip: when you hear it, how to answer, a Canadian habit. */
  noteRomanian?: string;
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
  translationRomanian?: string;
  tokens: readonly SentenceToken[];
  correctTokenOrder: readonly string[];
  completedSentence: string;
  focusItemIds?: readonly string[];
};

export type FillInTheBlankActivity = ActivityBase & {
  type: 'fill-in-the-blank';
  /** English sentence containing one `___` marker. */
  sentence: string;
  completedSentence: string;
  translationRomanian?: string;
  options: readonly ChoiceOption[];
  acceptedAnswers: readonly string[];
  focusItemIds?: readonly string[];
  audio?: AudioSource;
};

/** One line of a recorded dialogue: who says it, and what it means. */
export type DialogueLine = LearningText & {
  /** Store staff (cashier, clerk) speak with a Canadian voice; the customer with the usual one. */
  speaker: 'staff' | 'customer';
};

/** A short real-life dialogue at natural speed, then a question about it in Romanian. */
export type ListeningActivity = ActivityBase & {
  type: 'listening';
  audio: AudioSource;
  promptRomanian: string;
  options: readonly ChoiceOption[];
  correctOptionId: string;
  /** Shown after answering, so the learner can see what was said. */
  transcript: readonly DialogueLine[];
  focusItemIds?: readonly string[];
  explanationRomanian?: string;
};

/** Who she talks to in a conversation ("Casiera", "Vecina"). */
export type ConversationPartner = {
  nameRomanian: string;
  icon: string;
};

/**
 * One exchange of a talk-back conversation: the other person speaks (at real
 * speed), and she answers out loud; the microphone checks her answer.
 */
export type ConversationTurnActivity = ActivityBase & {
  type: 'conversation-turn';
  partner: ConversationPartner;
  /** The conversation so far, shown above ("staff" is the other person). */
  history: readonly DialogueLine[];
  /** What the other person says now; empty when she speaks first. */
  partnerLines: readonly LearningText[];
  partnerAudio?: AudioSource;
  /** In Romanian, what she should answer ("Spune că nu ai nevoie de pungă."). */
  taskRomanian: string;
  /** What she says. */
  response: LearningText;
  responseAudio: AudioSource;
  /** On the last turn: what the other person says to finish the conversation. */
  closingLines?: readonly LearningText[];
  closingAudio?: AudioSource;
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
  | ConversationTurnActivity
  | SpeakingActivity;

export type Lesson = {
  id: LessonId;
  schemaVersion: 1;
  title: LearningText;
  descriptionRomanian?: string;
  estimatedMinutes: number;
  activities: readonly LessonActivity[];
};

export type ActivityResponse =
  | { type: 'acknowledged' }
  | { type: 'choice'; optionId: string }
  | { type: 'matching'; pairings: Readonly<Record<string, string>> }
  | { type: 'token-order'; tokenIds: readonly string[] }
  | { type: 'text'; value: string }
  | { type: 'speaking-completed'; repetitions: number };
