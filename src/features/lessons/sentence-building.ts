import type { SentenceBuildingActivity } from '@/types';

export function normalizeSentenceAnswer(sentence: string): string {
  return sentence
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([([{])\s+/g, '$1')
    .replace(/\s+([)\]}])/g, '$1');
}

export function buildSentenceFromTokenOrder(
  activity: SentenceBuildingActivity,
  tokenIds: readonly string[],
): string | null {
  const tokensById = new Map(activity.tokens.map((token) => [token.id, token]));
  const selectedTokens = tokenIds.map((tokenId) => tokensById.get(tokenId));

  if (selectedTokens.some((token) => !token)) {
    return null;
  }

  return normalizeSentenceAnswer(selectedTokens.map((token) => token!.text).join(' '));
}

export function isSentenceBuildingAnswerCorrect(
  activity: SentenceBuildingActivity,
  tokenIds: readonly string[],
): boolean {
  if (
    tokenIds.length !== activity.correctTokenOrder.length ||
    new Set(tokenIds).size !== tokenIds.length
  ) {
    return false;
  }

  const answer = buildSentenceFromTokenOrder(activity, tokenIds);
  return answer !== null && answer === normalizeSentenceAnswer(activity.completedSentence);
}
