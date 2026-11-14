import type { VocabularyMasteryState, VocabularyProgress } from '@/types';

export const MIN_MASTERY_SCORE = 0;
export const MAX_MASTERY_SCORE = 8;
export const CORRECT_MASTERY_CHANGE = 1;
export const INCORRECT_MASTERY_CHANGE = -2;

export function clampMasteryScore(score: number): number {
  return Math.min(MAX_MASTERY_SCORE, Math.max(MIN_MASTERY_SCORE, Math.trunc(score)));
}

export function deriveMasteryScoreFromAttempts(
  correctAttempts: number,
  incorrectAttempts: number,
): number {
  return clampMasteryScore(
    correctAttempts * CORRECT_MASTERY_CHANGE +
      incorrectAttempts * INCORRECT_MASTERY_CHANGE,
  );
}

export function getVocabularyMasteryState(
  masteryScore: number,
  correctAttempts: number,
  incorrectAttempts: number,
): VocabularyMasteryState {
  if (correctAttempts === 0 && incorrectAttempts === 0) {
    return 'new';
  }
  if (masteryScore >= 6) {
    return 'strong';
  }
  if (masteryScore >= 3) {
    return 'familiar';
  }
  return 'learning';
}

export function updateVocabularyMastery(
  existing: VocabularyProgress | undefined,
  vocabularyId: string,
  result: boolean | null,
  practicedAt: string,
): VocabularyProgress {
  const correctAttempts = (existing?.correctAttempts ?? 0) + (result === true ? 1 : 0);
  const incorrectAttempts = (existing?.incorrectAttempts ?? 0) + (result === false ? 1 : 0);
  const masteryScore = clampMasteryScore(
    (existing?.masteryScore ?? 0) +
      (result === true
        ? CORRECT_MASTERY_CHANGE
        : result === false
          ? INCORRECT_MASTERY_CHANGE
          : 0),
  );

  return {
    vocabularyId,
    masteryScore,
    masteryState: getVocabularyMasteryState(
      masteryScore,
      correctAttempts,
      incorrectAttempts,
    ),
    correctAttempts,
    incorrectAttempts,
    lastPracticedAt: practicedAt,
  };
}
