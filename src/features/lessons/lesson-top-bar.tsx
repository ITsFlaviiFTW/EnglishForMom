import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/components/progress-bar';
import { colors, radii } from '@/constants/theme';

/** "✕ Ieși", the progress bar and "3/8", fixed above a lesson's cards. */
export function LessonTopBar({ position, total }: { position: number; total: number }) {
  return (
    <View style={styles.topBar}>
      <Link href="/lessons" asChild>
        <Pressable
          accessibilityLabel="Ieși din lecție. Progresul rămâne salvat."
          accessibilityRole="button"
          hitSlop={8}
          style={styles.exitPressable}>
          {({ pressed }) => (
            <View style={[styles.exitButton, pressed && styles.exitButtonPressed]}>
              <Text style={styles.exitIcon}>✕</Text>
              <Text style={styles.exitText}>Ieși</Text>
            </View>
          )}
        </Pressable>
      </Link>
      <ProgressBar
        accessibilityLabel={`Pasul ${position} din ${total}`}
        max={total}
        style={styles.topProgress}
        value={position}
      />
      <Text style={styles.stepCount}>
        {position}/{total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exitPressable: {
    borderRadius: radii.pill,
  },
  exitButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
  },
  exitButtonPressed: {
    backgroundColor: colors.primarySoft,
  },
  exitIcon: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  exitText: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  topProgress: {
    flex: 1,
  },
  stepCount: {
    minWidth: 48,
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
