import assert from 'node:assert/strict';
import test from 'node:test';

import { createDefaultProgress, recordLessonStarted } from '../src/features/progress/progress-state.ts';
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

test('a new repository instance restores saved progress after a simulated restart', async () => {
  const storage = new MemoryStorage();
  const beforeRestart = recordLessonStarted(createDefaultProgress(), 'level-1-kitchen-basics');

  await new ProgressRepository(storage).save(beforeRestart);
  const afterRestart = await new ProgressRepository(storage).load();

  assert.deepEqual(afterRestart, beforeRestart);
  assert.equal(serializeProgress(afterRestart), serializeProgress(beforeRestart));
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
