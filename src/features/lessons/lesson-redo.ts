import type {
  AudioSource,
  ExampleSentenceActivity,
  Lesson,
  VocabularyIntroductionActivity,
} from '@/types';

/**
 * What she can redo in a finished lesson: just the word cards, the dictation
 * (sentences with the English hidden, to write in the workbook), or all of it.
 */
export type RedoMode = 'words' | 'dictation' | 'all';

/** The workbook's dictation page has this many lines. */
export const DICTATION_SIZE = 8;

export type DictationSentence = {
  /** Its line on the workbook's "4. Dictare" page. */
  number: number;
  english: string;
  romanian: string;
  audio?: AudioSource;
  /** The lesson step that teaches this sentence: "Nu chiar" sends it to review. */
  activity: ExampleSentenceActivity | VocabularyIntroductionActivity;
};

export function parseRedoMode(value: unknown): RedoMode | null {
  return value === 'words' || value === 'dictation' || value === 'all' ? value : null;
}

/** The lesson's word and phrase cards, in order. */
export function getRedoWords(lesson: Lesson): VocabularyIntroductionActivity[] {
  return lesson.activities.filter(
    (activity): activity is VocabularyIntroductionActivity =>
      activity.type === 'vocabulary-introduction',
  );
}

/**
 * The dictation: the first example sentence of each word, at most eight, in
 * lesson order. The workbook prints the same list (scripts/generate-print.mjs),
 * so the numbers match the lines on its "4. Dictare" page.
 */
export function getDictationSentences(lesson: Lesson): DictationSentence[] {
  const sentences: DictationSentence[] = [];
  for (const word of getRedoWords(lesson)) {
    const example = word.examples?.[0];
    if (!example) {
      continue;
    }
    if (sentences.length === DICTATION_SIZE) {
      break;
    }
    const sentenceStep = lesson.activities.find(
      (activity): activity is ExampleSentenceActivity =>
        activity.type === 'example-sentence' && activity.sentence.english === example.english,
    );
    sentences.push({
      number: sentences.length + 1,
      english: example.english,
      romanian: example.romanian,
      audio: example.audio,
      activity: sentenceStep ?? word,
    });
  }
  return sentences;
}

/** Lessons with word cards offer the choice; a conversation just starts again. */
export function canChooseRedo(lesson: Lesson): boolean {
  return getRedoWords(lesson).length > 0;
}

/** About how long going through the word cards again takes. */
export function wordsMinutes(count: number): number {
  return Math.max(1, Math.round(count * 0.4));
}

/** "1 pas", "8 pași", "23 de pași": Romanian adds "de" from 20 up. */
export function countRo(count: number, one: string, many: string): string {
  if (count === 1) {
    return `1 ${one}`;
  }
  const rest = count % 100;
  return rest === 0 || rest >= 20 ? `${count} de ${many}` : `${count} ${many}`;
}
