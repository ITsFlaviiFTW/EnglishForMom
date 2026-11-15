import { Pressable, StyleSheet, Text } from 'react-native';

import { layout } from '@/constants/layout';
import { colors, radii, shadows } from '@/constants/theme';

type ActionButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  accessibilityLabel?: string;
};

export function ActionButton({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  accessibilityLabel,
}: ActionButtonProps) {
  const isPrimary = variant === 'primary';

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
        disabled && (isPrimary ? styles.primaryDisabled : styles.secondaryDisabled),
        pressed && !disabled && (isPrimary ? styles.primaryPressed : styles.secondaryPressed),
      ]}>
      <Text
        style={[
          styles.text,
          isPrimary ? styles.primaryText : styles.secondaryText,
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
  disabledText: {
    color: colors.textMuted,
  },
});
