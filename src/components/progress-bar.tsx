import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii } from '@/constants/theme';

type ProgressBarProps = {
  value: number;
  max: number;
  accessibilityLabel: string;
  tone?: 'default' | 'onPrimary';
  style?: StyleProp<ViewStyle>;
};

export function ProgressBar({
  value,
  max,
  accessibilityLabel,
  tone = 'default',
  style,
}: ProgressBarProps) {
  const percentage = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max, now: value }}
      style={[styles.track, tone === 'onPrimary' && styles.trackOnPrimary, style]}>
      <View
        style={[
          styles.fill,
          tone === 'onPrimary' && styles.fillOnPrimary,
          { width: `${percentage}%` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  trackOnPrimary: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  fillOnPrimary: {
    backgroundColor: colors.onPrimary,
  },
});
