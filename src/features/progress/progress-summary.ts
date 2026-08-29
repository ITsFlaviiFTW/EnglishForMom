import type { LearnerProgress } from '@/types';

export type ProgressSummary = {
  completedLessons: number;
  learningVocabulary: number;
  familiarVocabulary: number;
};

export function summarizeProgress(progress: LearnerProgress): ProgressSummary {
  const vocabulary = Object.values(progress.vocabulary);

  return {
    completedLessons: progress.completedLessonIds.length,
    learningVocabulary: vocabulary.filter((item) => item.familiarity === 'learning').length,
    familiarVocabulary: vocabulary.filter((item) => item.familiarity === 'familiar').length,
  };
}
