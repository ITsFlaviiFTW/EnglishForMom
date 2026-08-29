export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const storageKeys = {
  learnerProgress: 'english-for-mom:learner-progress:v1',
} as const;
