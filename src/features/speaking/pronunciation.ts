/**
 * Decides whether a spoken attempt counts as "said right", from Azure's
 * pronunciation assessment.
 *
 * The bar is set for a beginner with a Romanian accent: the app's own
 * Romanian-accent readings (Alina reading the "Se citește" spelling) pass 39 of
 * 40 sampled phrases, native recordings all pass, and a different phrase never
 * passes. Words Azure marks as mispronounced or left out are shown in red, even
 * when the attempt passes, so she knows what to practise.
 */

/** Overall accuracy (0–100) needed to pass a phrase or sentence. */
export const PASS_ACCURACY = 60;
/** Single words are checked a little more strictly: one wrong word is the whole answer. */
export const PASS_SINGLE_WORD_ACCURACY = 70;
/** Share of the words that must be said at all (mispronounced still counts as said). */
export const MIN_SAID_SHARE = 0.75;

type AzureScores = {
  AccuracyScore?: number;
  FluencyScore?: number;
  CompletenessScore?: number;
  PronScore?: number;
};

export type AzureWord = AzureScores & {
  Word: string;
  ErrorType?: string;
  PronunciationAssessment?: AzureScores & { ErrorType?: string };
};

/** The JSON body of Azure's short-audio recognition with pronunciation assessment. */
export type AzurePronunciationResponse = {
  RecognitionStatus: string;
  DisplayText?: string;
  NBest?: readonly (AzureScores & {
    Lexical?: string;
    Words?: readonly AzureWord[];
    PronunciationAssessment?: AzureScores;
  })[];
};

export type SpokenWord = {
  text: string;
  /** good: said well; weak: mispronounced; missed: not said; unknown: could not be matched. */
  status: 'good' | 'weak' | 'missed' | 'unknown';
};

export type PronunciationVerdict = {
  status: 'passed' | 'retry' | 'not-heard';
  accuracy: number;
  /** The reference text, word by word, as she should say it. */
  words: readonly SpokenWord[];
};

/** The Pronunciation-Assessment header value: base64 of the UTF-8 JSON settings. */
export function createAssessmentHeader(referenceText: string): string {
  const json = JSON.stringify({
    ReferenceText: referenceText,
    GradingSystem: 'HundredMark',
    Granularity: 'Word',
    Dimension: 'Comprehensive',
    EnableMiscue: true,
  });
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export function evaluatePronunciation(
  referenceText: string,
  response: AzurePronunciationResponse,
): PronunciationVerdict {
  const tokens = referenceText.split(/\s+/).filter((token) => normalizeWord(token).length > 0);
  const best = response.NBest?.[0];
  const unknownWords = tokens.map((text) => ({ text, status: 'unknown' as const }));

  if (response.RecognitionStatus !== 'Success' || !best) {
    return { status: 'not-heard', accuracy: 0, words: unknownWords };
  }

  // Extra words she said that are not in the phrase do not count against her.
  const referenceWords = (best.Words ?? []).filter((word) => errorTypeOf(word) !== 'Insertion');
  const saidWords = referenceWords.filter((word) => errorTypeOf(word) !== 'Omission');
  if (referenceWords.length === 0) {
    return { status: 'not-heard', accuracy: 0, words: unknownWords };
  }
  // She spoke, but none of it matched: something else was said.
  if (saidWords.length === 0) {
    return {
      status: 'retry',
      accuracy: 0,
      words: tokens.map((text) => ({ text, status: 'missed' as const })),
    };
  }

  const accuracy = scoreOf(best, 'AccuracyScore') ?? average(referenceWords);
  const saidShare = saidWords.length / referenceWords.length;
  const needed = referenceWords.length === 1 ? PASS_SINGLE_WORD_ACCURACY : PASS_ACCURACY;
  const passed = accuracy >= needed && saidShare >= MIN_SAID_SHARE;

  return {
    status: passed ? 'passed' : 'retry',
    accuracy,
    words: matchWords(tokens, referenceWords),
  };
}

/** Pairs Azure's words with the phrase as written, so the colours land on the right words. */
function matchWords(tokens: readonly string[], azureWords: readonly AzureWord[]): SpokenWord[] {
  const statusOf = (word: AzureWord): SpokenWord['status'] => {
    const errorType = errorTypeOf(word);
    if (errorType === 'Omission') {
      return 'missed';
    }
    return errorType === 'Mispronunciation' ? 'weak' : 'good';
  };

  if (tokens.length === azureWords.length) {
    return tokens.map((text, index) => ({ text, status: statusOf(azureWords[index]) }));
  }

  // Numbers and hyphenated words can be split differently: match by spelling, in order.
  let next = 0;
  return tokens.map((text) => {
    const wanted = normalizeWord(text);
    for (let index = next; index < azureWords.length; index += 1) {
      if (normalizeWord(azureWords[index].Word) === wanted) {
        next = index + 1;
        return { text, status: statusOf(azureWords[index]) };
      }
    }
    return { text, status: 'unknown' };
  });
}

function errorTypeOf(word: AzureWord): string {
  return word.ErrorType ?? word.PronunciationAssessment?.ErrorType ?? 'None';
}

function scoreOf(
  scores: AzureScores & { PronunciationAssessment?: AzureScores },
  name: keyof AzureScores,
): number | undefined {
  return scores[name] ?? scores.PronunciationAssessment?.[name];
}

function average(words: readonly AzureWord[]): number {
  const total = words.reduce((sum, word) => sum + (scoreOf(word, 'AccuracyScore') ?? 0), 0);
  return total / words.length;
}

function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9'-]/g, '');
}
