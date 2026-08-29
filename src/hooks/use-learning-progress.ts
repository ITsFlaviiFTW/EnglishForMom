import { useContext } from 'react';

import { ProgressContext } from '@/features/progress/progress-provider';

export function useLearningProgress() {
  const value = useContext(ProgressContext);
  if (!value) {
    throw new Error('useLearningProgress must be used inside ProgressProvider.');
  }

  return value;
}
