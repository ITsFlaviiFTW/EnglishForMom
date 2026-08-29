import assert from 'node:assert/strict';
import test from 'node:test';

import { kitchenBasicsLesson } from '../src/data/lessons/kitchen-basics.ts';
import {
  createDefaultProgress,
  recordActivityCompletion,
  recordLessonStarted,
} from '../src/features/progress/progress-state.ts';
import {
  deserializeProgress,
  serializeProgress,
} from '../src/storage/progress-serialization.ts';
import { ProgressRepository } from '../src/storage/progress-repository.ts';

class MemoryStorage {
  values = new Map();

  async getItem(key) {
    return this.values.get(key) ?? null;
  }

  async setItem(key, value) {
    this.values.set(key, value);
  }

  async removeItem(key) {
    this.values.delete(key);
  }
}

test('returns safe defaults for missing, corrupt, and unsupported saves', () => {
  const expected = createDefaultProgress();

  assert.deepEqual(deserializeProgress(null), expected);
  assert.deepEqual(deserializeProgress('{not json'), expected);
  assert.deepEqual(deserializeProgress(JSON.stringify({ schemaVersion: 99 })), expected);
});

test('normalizes damaged fields without discarding valid versioned data', () => {
  const progress = deserializeProgress(
    JSON.stringify({
      schemaVersion: 1,
      currentLessonId: 'kitchen',
      completedLessonIds: ['kitchen', 42],
      correctAnswers: -10,
      lessons: 'damaged',
      vocabulary: null,
    }),
  );

  assert.equal(progress.currentLessonId, 'kitchen');
  assert.deepEqual(progress.completedLessonIds, ['kitchen']);
  assert.equal(progress.correctAnswers, 0);
  assert.deepEqual(progress.lessons, {});
});

test('migrates a version 1 save to version 2 with an empty review collection', () => {
  const migrated = deserializeProgress(
    JSON.stringify({
      schemaVersion: 1,
      currentLessonId: 'kitchen',
      completedLessonIds: [],
      correctAnswers: 2,
      incorrectAnswers: 1,
    }),
  );

  assert.equal(migrated.schemaVersion, 2);
  assert.equal(migrated.currentLessonId, 'kitchen');
  assert.deepEqual(migrated.reviewItems, {});
});

test('a new repository instance restores saved progress after a simulated restart', async () => {
  const storage = new MemoryStorage();
  const beforeRestart = recordLessonStarted(createDefaultProgress(), 'level-1-kitchen-basics');

  await new ProgressRepository(storage).save(beforeRestart);
  const afterRestart = await new ProgressRepository(storage).load();

  assert.deepEqual(afterRestart, beforeRestart);
  assert.equal(serializeProgress(afterRestart), serializeProgress(beforeRestart));
});

test('review priority and context survive a simulated restart', async () => {
  const storage = new MemoryStorage();
  const question = kitchenBasicsLesson.activities.find(
    (activity) => activity.id === 'recall-stove-ro',
  );
  assert.equal(question?.type, 'multiple-choice');
  const beforeRestart = recordActivityCompletion(createDefaultProgress(), {
    lesson: kitchenBasicsLesson,
    activity: question,
    response: { type: 'choice', optionId: 'fridge' },
    correct: false,
    completedAt: '2026-08-29T12:00:00.000Z',
  });

  await new ProgressRepository(storage).save(beforeRestart);
  const afterRestart = await new ProgressRepository(storage).load();

  assert.equal(afterRestart.reviewItems['vocabulary:stove'].priority, 3);
  assert.deepEqual(afterRestart.reviewItems['vocabulary:stove'].content, {
    english: 'stove',
    romanian: 'aragaz',
  });
});

test('storage read failures also return safe defaults', async () => {
  const failingStorage = {
    async getItem() {
      throw new Error('unavailable');
    },
    async setItem() {},
    async removeItem() {},
  };

  assert.deepEqual(await new ProgressRepository(failingStorage).load(), createDefaultProgress());
});
