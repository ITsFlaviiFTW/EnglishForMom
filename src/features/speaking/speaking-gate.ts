import type { ActivityResponse, AudioSource, LessonActivity } from '@/types';

/** After this many tries without passing, "Sari peste" appears. */
export const MAX_SPEAKING_ATTEMPTS = 5;

/**
 * Where she is with saying the current word or sentence:
 * - trying: no pass yet (attempts counts every try, including "not heard")
 * - passed: said right; Continue unlocks
 * - skipped: gave up after MAX_SPEAKING_ATTEMPTS; the item goes to review
 * - unavailable: no microphone, no internet or the check is down; she may continue
 */
export type SpeakingOutcome = {
  attempts: number;
  status: 'trying' | 'passed' | 'skipped' | 'unavailable';
};

export type SpeakingTarget = {
  text: string;
  audio: AudioSource;
};

/** The word or sentence she must say on this step, or null when the step has none. */
export function getSpeakingTarget(activity: LessonActivity): SpeakingTarget | null {
  if (activity.type === 'vocabulary-introduction' && activity.audio) {
    return { text: activity.content.english, audio: activity.audio };
  }
  if (activity.type === 'example-sentence' && activity.sentence.audio) {
    return { text: activity.sentence.english, audio: activity.sentence.audio };
  }
  return null;
}

export function isSpeakingStepDone(outcome: SpeakingOutcome | undefined): boolean {
  return outcome !== undefined && outcome.status !== 'trying';
}

export function canSkipSpeaking(outcome: SpeakingOutcome | undefined): boolean {
  return outcome?.status === 'trying' && outcome.attempts >= MAX_SPEAKING_ATTEMPTS;
}

export function recordSpeakingAttempt(
  outcome: SpeakingOutcome | undefined,
  result: 'passed' | 'retry' | 'unavailable',
): SpeakingOutcome {
  const attempts = (outcome?.attempts ?? 0) + (result === 'unavailable' ? 0 : 1);
  if (outcome && outcome.status !== 'trying') {
    // A later try after passing never takes the pass away.
    return { ...outcome, attempts };
  }
  return {
    attempts,
    status: result === 'retry' ? 'trying' : result,
  };
}

export function skipSpeaking(outcome: SpeakingOutcome | undefined): SpeakingOutcome {
  return { attempts: outcome?.attempts ?? 0, status: 'skipped' };
}

/** How the finished step is saved: passing counts as correct, skipping as a mistake. */
export function speakingCompletion(outcome: SpeakingOutcome | undefined): {
  response: ActivityResponse;
  correct: boolean | null;
} {
  if (!outcome || outcome.attempts === 0) {
    return { response: { type: 'acknowledged' }, correct: null };
  }
  const response: ActivityResponse = { type: 'speaking-completed', repetitions: outcome.attempts };
  switch (outcome.status) {
    case 'passed':
      return { response, correct: true };
    case 'skipped':
      return { response, correct: false };
    default:
      return { response, correct: null };
  }
}
