import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { ScreenContainer } from '@/components/screen-container';
import { colors } from '@/constants/theme';
import { kitchenBasicsLesson } from '@/data/lessons/kitchen-basics';

export default function HomeScreen() {
  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>ENGLEZĂ PRACTICĂ, ZI DE ZI</Text>
        <Text style={styles.title}>EnglishForMom</Text>
        <Text style={styles.description}>Învață engleza pas cu pas, în ritmul tău.</Text>
      </View>

      <View style={styles.actions}>
        <AppButton
          href={{ pathname: '/lessons/[lessonId]', params: { lessonId: kitchenBasicsLesson.id } }}
          title="Continue Learning"
          subtitle="Continuă lecția"
          variant="primary"
        />
        <AppButton href="/lessons" title="Lessons" subtitle="Vezi toate lecțiile" />
        <AppButton href="/review" title="Review" subtitle="Repetă ce ai învățat" />
        <AppButton href="/progress" title="Progress" subtitle="Urmărește progresul" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
    paddingVertical: 36,
  },
  intro: {
    marginBottom: 36,
  },
  actions: {
    gap: 14,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '700',
    lineHeight: 49,
  },
  description: {
    color: colors.textMuted,
    fontSize: 20,
    lineHeight: 30,
    marginTop: 12,
  },
});
