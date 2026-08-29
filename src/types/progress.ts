import type { ActivityId, ActivityResponse, LearningText, LessonId } from './lesson';

export type ActivityResult = {
  activityId: ActivityId;
  response: ActivityResponse;
  correct: boolean | null;
  attempts: number;
  completedAt: string;
};

export type VocabularyFamiliarity = 'new' | 'learning' | 'familiar';

export type VocabularyProgress = {
  vocabularyId: string;
  familiarity: VocabularyFamiliarity;
  correctAttempts: number;
  incorrectAttempts: number;
  lastPracticedAt: string;
};

export type LessonProgress = {
  lessonId: LessonId;
  completed: boolean;
  lastCompletedActivityId: ActivityId | null;
  nextActivityIndex: number;
  correctAnswers: number;
  incorrectAnswers: number;
  activityResults: readonly ActivityResult[];
  lastPracticedAt: string;
};

export type QuestionMistakeProgress = {
  lessonId: LessonId;
  activityId: ActivityId;
  incorrectAttempts: number;
  lastSelectedOptionId: string;
  lastMissedAt: string;
};

export type ReviewItemKind = 'vocabulary' | 'comprehension';

export type ReviewItemProgress = {
  id: string;
  kind: ReviewItemKind;
  lessonId: LessonId;
  sourceActivityId: ActivityId;
  learningItemId: string;
  content: LearningText;
  example?: LearningText;
  priority: number;
  correctAttempts: number;
  incorrectAttempts: number;
  correctStreak: number;
  lastMissedAt: string;
  lastReviewedAt: string | null;
};

export type LearnerProgress = {
  schemaVersion: 2;
  currentLessonId: LessonId | null;
  recentLessonId: LessonId | null;
  completedLessonIds: readonly LessonId[];
  correctAnswers: number;
  incorrectAnswers: number;
  lastPracticedAt: string | null;
  lessons: Readonly<Record<LessonId, LessonProgress>>;
  vocabulary: Readonly<Record<string, VocabularyProgress>>;
  questionMistakes: Readonly<Record<string, QuestionMistakeProgress>>;
  reviewItems: Readonly<Record<string, ReviewItemProgress>>;
};
