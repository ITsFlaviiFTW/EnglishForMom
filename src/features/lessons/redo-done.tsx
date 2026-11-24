import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { AppCard } from '@/components/app-card';
import { ScreenContainer } from '@/components/screen-container';
import { colors } from '@/constants/theme';

/**
 * The end of a redo: a short "Gata!", then home or back to the lesson's
 * choices. It never suggests the next lesson: new lessons follow her plan.
 */
export function RedoDone({
  lessonId,
  message,
  detail,
}: {
  lessonId: string;
  message: string;
  /** A line in a card under the message (what goes to "Repetă"). */
  detail?: string;
}) {
  const router = useRouter();

  return (
    <ScreenContainer
      style={styles.screen}
      footer={
        <View style={styles.actions}>
          <ActionButton onPress={() => router.replace('/')} title="Acasă" />
          <ActionButton
            onPress={() =>
              router.replace({ pathname: '/lessons/[lessonId]', params: { lessonId } })
            }
            title="Repetă altceva"
            variant="secondary"
          />
        </View>
      }>
      <View style={styles.celebration}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <Text accessibilityRole="header" style={styles.title}>
          Gata!
        </Text>
        <Text style={styles.text}>{message}</Text>
      </View>
      {detail ? (
        <AppCard>
          <Text style={styles.detail}>{detail}</Text>
        </AppCard>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 22,
  },
  actions: {
    gap: 12,
  },
  celebration: {
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  checkMark: {
    color: colors.success,
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '800',
    textAlign: 'center',
  },
  text: {
    color: colors.textMuted,
    fontSize: 20,
    lineHeight: 29,
    textAlign: 'center',
  },
  detail: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 27,
  },
});
