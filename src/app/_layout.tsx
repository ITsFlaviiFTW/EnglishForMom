import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { colors } from '@/constants/theme';
import { ProgressProvider } from '@/features/progress/progress-provider';
import { unlockAudioOnFirstTap } from '@/services/lesson-audio-service';

export default function RootLayout() {
  // Cards play their word by themselves; on iPhone that needs one tap first.
  useEffect(() => unlockAudioOnFirstTap(), []);

  return (
    <ProgressProvider>
      <Head>
        <title>Prava</title>
      </Head>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      />
      <StatusBar style="dark" />
    </ProgressProvider>
  );
}
