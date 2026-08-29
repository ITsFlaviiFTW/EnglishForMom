import { asyncStorageAdapter } from '@/storage/async-storage-adapter';
import { ProgressRepository } from '@/storage/progress-repository';

export const progressRepository = new ProgressRepository(asyncStorageAdapter);
