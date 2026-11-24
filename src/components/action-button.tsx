import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { layout } from '@/constants/layout';
import { colors, radii, shadows } from '@/constants/theme';

type ActionButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  /** "warm": a brown outline, for an answer like "Nu chiar". */
  variant?: 'primary' | 'secondary' | 'warm';
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function ActionButton({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  accessibilityLabel,
  style,
}: ActionButtonProps) {
  const isPrimary = variant === 'primary';
  const isWarm = variant === 'warm';

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        isWarm && styles.warm,
        disabled && (isPrimary ? styles.primaryDisabled : styles.secondaryDisabled),
        pressed && !disabled && (isPrimary ? styles.primaryPressed : styles.secondaryPressed),
        style,
      ]}>
      <Text
        style={[
          styles.text,
          isPrimary ? styles.primaryText : isWarm ? styles.warmText : styles.secondaryText,
          disabled && styles.disabledText,
        ]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: Math.max(62, layout.minimumTouchTarget),
    borderRadius: radii.medium,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  primary: {
    backgroundColor: colors.primary,
    boxShadow: shadows.raised,
  },
  primaryPressed: {
    backgroundColor: colors.primaryPressed,
    transform: [{ scale: 0.99 }],
  },
  primaryDisabled: {
    backgroundColor: colors.surfaceMuted,
    boxShadow: 'none',
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  warm: {
    borderColor: colors.warm,
  },
  secondaryPressed: {
    backgroundColor: colors.primarySoft,
  },
  secondaryDisabled: {
    borderColor: colors.border,
  },
  text: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryText: {
    color: colors.onPrimary,
  },
  secondaryText: {
    color: colors.primary,
  },
  warmText: {
    color: colors.warm,
  },
  disabledText: {
    color: colors.textMuted,
  },
});
