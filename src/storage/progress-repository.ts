import { createDefaultProgress } from '../features/progress/progress-state.ts';
import { deserializeProgress, serializeProgress } from './progress-serialization.ts';
import { storageKeys, type StorageAdapter } from './storage-adapter.ts';
import type { LearnerProgress } from '@/types';

export interface LearningProgressRepository {
  load(): Promise<LearnerProgress>;
  save(progress: LearnerProgress): Promise<void>;
  clear(): Promise<void>;
}

export class ProgressRepository implements LearningProgressRepository {
  private readonly storage: StorageAdapter;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(storage: StorageAdapter) {
    this.storage = storage;
  }

  async load(): Promise<LearnerProgress> {
    try {
      return deserializeProgress(await this.storage.getItem(storageKeys.learnerProgress));
    } catch {
      return createDefaultProgress();
    }
  }

  save(progress: LearnerProgress): Promise<void> {
    const serialized = serializeProgress(progress);
    const write = this.writeQueue
      .catch(() => undefined)
      .then(() => this.storage.setItem(storageKeys.learnerProgress, serialized));
    this.writeQueue = write;
    return write;
  }

  async clear(): Promise<void> {
    await this.writeQueue.catch(() => undefined);
    await this.storage.removeItem(storageKeys.learnerProgress);
  }
}
