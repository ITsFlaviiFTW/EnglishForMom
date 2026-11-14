import type { LearnerProgress } from '@/types';

export type ProgressSummary = {
  wordsIntroduced: number;
  wordsLearning: number;
  wordsFamiliar: number;
  wordsStrong: number;
};

export function summarizeProgress(progress: LearnerProgress): ProgressSummary {
  const vocabulary = Object.values(progress.vocabulary);

  return {
    wordsIntroduced: vocabulary.length,
    wordsLearning: vocabulary.filter((item) => item.masteryState === 'learning').length,
    wordsFamiliar: vocabulary.filter((item) => item.masteryState === 'familiar').length,
    wordsStrong: vocabulary.filter((item) => item.masteryState === 'strong').length,
  };
}
