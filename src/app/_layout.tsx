import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/constants/theme';
import { ProgressProvider } from '@/features/progress/progress-provider';

export default function RootLayout() {
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
