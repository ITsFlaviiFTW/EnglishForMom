import type { ActivityId, ActivityResponse, LessonId } from './lesson';

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
  activityResults: readonly ActivityResult[];
  lastPracticedAt: string;
};

export type LearnerProgress = {
  schemaVersion: 1;
  currentLessonId: LessonId | null;
  completedLessonIds: readonly LessonId[];
  lessons: Readonly<Record<LessonId, LessonProgress>>;
  vocabulary: Readonly<Record<string, VocabularyProgress>>;
};
