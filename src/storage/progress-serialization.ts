import { createDefaultProgress } from '../features/progress/progress-state.ts';
import type {
  ActivityResponse,
  ActivityResult,
  LearnerProgress,
  LessonProgress,
  QuestionMistakeProgress,
  ReviewItemProgress,
  VocabularyProgress,
} from '@/types';

export function serializeProgress(progress: LearnerProgress): string {
  return JSON.stringify(progress);
}

export function deserializeProgress(raw: string | null): LearnerProgress {
  if (!raw) {
    return createDefaultProgress();
  }

  try {
    return migrateStoredProgress(JSON.parse(raw));
  } catch {
    return createDefaultProgress();
  }
}

export function migrateStoredProgress(value: unknown): LearnerProgress {
  if (!isRecord(value) || (value.schemaVersion !== 1 && value.schemaVersion !== 2)) {
    return createDefaultProgress();
  }

  // Version 1 had no reviewItems. Normalization supplies the safe version 2 default,
  // and the provider reconstructs review records from persisted question mistakes.
  return normalizeCurrentVersion(value);
}

function normalizeCurrentVersion(value: Record<string, unknown>): LearnerProgress {
  const lessons = normalizeLessons(value.lessons);
  const derivedCorrectAnswers = Object.values(lessons).reduce(
    (total, lesson) => total + lesson.correctAnswers,
    0,
  );
  const derivedIncorrectAnswers = Object.values(lessons).reduce(
    (total, lesson) => total + lesson.incorrectAnswers,
    0,
  );

  return {
    schemaVersion: 2,
    currentLessonId: nullableString(value.currentLessonId),
    recentLessonId: nullableString(value.recentLessonId),
    completedLessonIds: stringArray(value.completedLessonIds),
    correctAnswers: nonNegativeInteger(value.correctAnswers) ?? derivedCorrectAnswers,
    incorrectAnswers: nonNegativeInteger(value.incorrectAnswers) ?? derivedIncorrectAnswers,
    lastPracticedAt: nullableTimestamp(value.lastPracticedAt),
    lessons,
    vocabulary: normalizeVocabulary(value.vocabulary),
    questionMistakes: normalizeQuestionMistakes(value.questionMistakes),
    reviewItems: normalizeReviewItems(value.reviewItems),
  };
}

function normalizeLessons(value: unknown): LearnerProgress['lessons'] {
  if (!isRecord(value)) {
    return {};
  }

  const lessons: Record<string, LessonProgress> = {};
  for (const [key, candidate] of Object.entries(value)) {
    if (!isRecord(candidate)) {
      continue;
    }

    const lessonId = stringValue(candidate.lessonId) ?? key;
    const activityResults = Array.isArray(candidate.activityResults)
      ? candidate.activityResults.flatMap((result) => {
          const normalized = normalizeActivityResult(result);
          return normalized ? [normalized] : [];
        })
      : [];
    const correctAnswers =
      nonNegativeInteger(candidate.correctAnswers) ??
      activityResults.filter((result) => result.correct === true).length;
    const incorrectAnswers =
      nonNegativeInteger(candidate.incorrectAnswers) ??
      activityResults.filter((result) => result.correct === false).length;
    const lastResult = activityResults.at(-1);
    const lastPracticedAt = timestamp(candidate.lastPracticedAt) ?? lastResult?.completedAt;

    if (!lastPracticedAt) {
      continue;
    }

    lessons[lessonId] = {
      lessonId,
      completed: candidate.completed === true,
      lastCompletedActivityId:
        nullableString(candidate.lastCompletedActivityId) ?? lastResult?.activityId ?? null,
      nextActivityIndex:
        nonNegativeInteger(candidate.nextActivityIndex) ?? activityResults.length,
      correctAnswers,
      incorrectAnswers,
      activityResults,
      lastPracticedAt,
    };
  }

  return lessons;
}

function normalizeActivityResult(value: unknown): ActivityResult | null {
  if (!isRecord(value)) {
    return null;
  }

  const activityId = stringValue(value.activityId);
  const response = normalizeResponse(value.response);
  const completedAt = timestamp(value.completedAt);
  const correct = value.correct === true || value.correct === false || value.correct === null
    ? value.correct
    : null;

  if (!activityId || !response || !completedAt) {
    return null;
  }

  return {
    activityId,
    response,
    correct,
    attempts: nonNegativeInteger(value.attempts) ?? 1,
    completedAt,
  };
}

function normalizeResponse(value: unknown): ActivityResponse | null {
  if (!isRecord(value) || typeof value.type !== 'string') {
    return null;
  }

  switch (value.type) {
    case 'acknowledged':
      return { type: 'acknowledged' };
    case 'choice': {
      const optionId = stringValue(value.optionId);
      return optionId ? { type: 'choice', optionId } : null;
    }
    case 'matching': {
      if (!isRecord(value.pairings)) {
        return null;
      }
      const pairings = Object.fromEntries(
        Object.entries(value.pairings).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string',
        ),
      );
      return { type: 'matching', pairings };
    }
    case 'token-order':
      return { type: 'token-order', tokenIds: stringArray(value.tokenIds) };
    case 'text': {
      const text = stringValue(value.value);
      return text === null ? null : { type: 'text', value: text };
    }
    case 'speaking-completed': {
      const repetitions = nonNegativeInteger(value.repetitions);
      return repetitions === null ? null : { type: 'speaking-completed', repetitions };
    }
    default:
      return null;
  }
}

function normalizeVocabulary(value: unknown): LearnerProgress['vocabulary'] {
  if (!isRecord(value)) {
    return {};
  }

  const vocabulary: Record<string, VocabularyProgress> = {};
  for (const [key, candidate] of Object.entries(value)) {
    if (!isRecord(candidate)) {
      continue;
    }

    const vocabularyId = stringValue(candidate.vocabularyId) ?? key;
    const lastPracticedAt = timestamp(candidate.lastPracticedAt);
    const familiarity = candidate.familiarity;
    if (
      !lastPracticedAt ||
      (familiarity !== 'new' && familiarity !== 'learning' && familiarity !== 'familiar')
    ) {
      continue;
    }

    vocabulary[vocabularyId] = {
      vocabularyId,
      familiarity,
      correctAttempts: nonNegativeInteger(candidate.correctAttempts) ?? 0,
      incorrectAttempts: nonNegativeInteger(candidate.incorrectAttempts) ?? 0,
      lastPracticedAt,
    };
  }

  return vocabulary;
}

function normalizeQuestionMistakes(value: unknown): LearnerProgress['questionMistakes'] {
  if (!isRecord(value)) {
    return {};
  }

  const mistakes: Record<string, QuestionMistakeProgress> = {};
  for (const [key, candidate] of Object.entries(value)) {
    if (!isRecord(candidate)) {
      continue;
    }

    const lessonId = stringValue(candidate.lessonId);
    const activityId = stringValue(candidate.activityId);
    const lastSelectedOptionId = stringValue(candidate.lastSelectedOptionId);
    const lastMissedAt = timestamp(candidate.lastMissedAt);
    if (!lessonId || !activityId || !lastSelectedOptionId || !lastMissedAt) {
      continue;
    }

    mistakes[key] = {
      lessonId,
      activityId,
      incorrectAttempts: nonNegativeInteger(candidate.incorrectAttempts) ?? 1,
      lastSelectedOptionId,
      lastMissedAt,
    };
  }

  return mistakes;
}

function normalizeReviewItems(value: unknown): LearnerProgress['reviewItems'] {
  if (!isRecord(value)) {
    return {};
  }

  const items: Record<string, ReviewItemProgress> = {};
  for (const [key, candidate] of Object.entries(value)) {
    if (!isRecord(candidate)) {
      continue;
    }

    const id = stringValue(candidate.id) ?? key;
    const kind = candidate.kind;
    const lessonId = stringValue(candidate.lessonId);
    const sourceActivityId = stringValue(candidate.sourceActivityId);
    const learningItemId = stringValue(candidate.learningItemId);
    const content = normalizeLearningText(candidate.content);
    const example = normalizeLearningText(candidate.example);
    const lastMissedAt = timestamp(candidate.lastMissedAt);
    const lastReviewedAt = nullableTimestamp(candidate.lastReviewedAt);
    if (
      (kind !== 'vocabulary' && kind !== 'comprehension') ||
      !lessonId ||
      !sourceActivityId ||
      !learningItemId ||
      !content ||
      !lastMissedAt
    ) {
      continue;
    }

    items[id] = {
      id,
      kind,
      lessonId,
      sourceActivityId,
      learningItemId,
      content,
      ...(example ? { example } : {}),
      priority: Math.min(10, nonNegativeInteger(candidate.priority) ?? 0),
      correctAttempts: nonNegativeInteger(candidate.correctAttempts) ?? 0,
      incorrectAttempts: nonNegativeInteger(candidate.incorrectAttempts) ?? 0,
      correctStreak: nonNegativeInteger(candidate.correctStreak) ?? 0,
      lastMissedAt,
      lastReviewedAt,
    };
  }

  return items;
}

function normalizeLearningText(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  const english = stringValue(value.english);
  const romanian = stringValue(value.romanian);
  return english !== null && romanian !== null ? { english, romanian } : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function nullableString(value: unknown): string | null {
  return value === null ? null : stringValue(value);
}

function timestamp(value: unknown): string | null {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : null;
}

function nullableTimestamp(value: unknown): string | null {
  return value === null ? null : timestamp(value);
}

function nonNegativeInteger(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}
