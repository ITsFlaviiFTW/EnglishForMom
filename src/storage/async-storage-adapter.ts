import AsyncStorage from '@react-native-async-storage/async-storage';

import type { StorageAdapter } from '@/storage/storage-adapter';

export const asyncStorageAdapter: StorageAdapter = {
  getItem(key) {
    return AsyncStorage.getItem(key);
  },
  setItem(key, value) {
    return AsyncStorage.setItem(key, value);
  },
  removeItem(key) {
    return AsyncStorage.removeItem(key);
  },
};
