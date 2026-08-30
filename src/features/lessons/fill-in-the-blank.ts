import type { FillInTheBlankActivity } from '@/types';

export function normalizeFillInAnswer(answer: string): string {
  return answer.trim().toLocaleLowerCase('en-US').replace(/\s+/g, ' ');
}

export function isFillInAnswerCorrect(
  activity: FillInTheBlankActivity,
  answer: string,
): boolean {
  const normalizedAnswer = normalizeFillInAnswer(answer);

  return activity.acceptedAnswers.some(
    (acceptedAnswer) => normalizeFillInAnswer(acceptedAnswer) === normalizedAnswer,
  );
}
