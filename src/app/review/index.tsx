import { StyleSheet, Text } from 'react-native';

import { AppCard } from '@/components/app-card';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { colors } from '@/constants/theme';

export default function ReviewScreen() {
  return (
    <ScreenContainer style={styles.screen}>
      <ScreenHeader
        title="Repetare"
        description="Aici vei exersa din nou cuvintele care au nevoie de mai multă atenție."
      />

      <AppCard title="Nimic de repetat încă">
        <Text style={styles.message}>
          Cuvintele și răspunsurile greșite vor apărea aici după ce începi lecțiile.
        </Text>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 36,
  },
  message: {
    color: colors.textMuted,
    fontSize: 18,
    lineHeight: 28,
  },
});
