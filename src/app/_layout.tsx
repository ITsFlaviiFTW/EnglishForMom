import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ProgressProvider } from '@/features/progress/progress-provider';

export default function RootLayout() {
  return (
    <ProgressProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="dark" />
    </ProgressProvider>
  );
}
