import type { LearnerProgress } from '@/types';

export type ProgressSummary = {
  completedLessons: number;
  practicedVocabulary: number;
  correctAnswers: number;
  incorrectAnswers: number;
  studyDays: number;
};

export function summarizeProgress(progress: LearnerProgress): ProgressSummary {
  const studyDates = new Set(
    Object.values(progress.lessons).flatMap((lesson) =>
      lesson.activityResults.map((result) => result.completedAt.slice(0, 10)),
    ),
  );

  return {
    completedLessons: progress.completedLessonIds.length,
    practicedVocabulary: Object.keys(progress.vocabulary).length,
    correctAnswers: progress.correctAnswers,
    incorrectAnswers: progress.incorrectAnswers,
    studyDays: studyDates.size,
  };
}
