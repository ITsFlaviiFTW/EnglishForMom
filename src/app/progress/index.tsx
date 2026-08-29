import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/app-card';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { colors } from '@/constants/theme';

const progressItems = [
  { label: 'Lecții finalizate', value: '0' },
  { label: 'Cuvinte învățate', value: '0' },
  { label: 'Zile de studiu', value: '0' },
] as const;

export default function ProgressScreen() {
  return (
    <ScreenContainer style={styles.screen}>
      <ScreenHeader
        title="Progres"
        description="Rezultatele tale vor fi salvate pe acest dispozitiv."
      />

      <AppCard title="La început de drum" description="Progresul va apărea după prima lecție.">
        <View style={styles.summary}>
          {progressItems.map((item) => (
            <View key={item.label} style={styles.summaryRow}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
          ))}
        </View>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 36,
  },
  summary: {
    gap: 14,
  },
  summaryRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  label: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 24,
  },
  value: {
    color: colors.primary,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
});
