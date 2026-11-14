import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { layout } from '@/constants/layout';
import { colors } from '@/constants/theme';

type AppButtonBaseProps = {
  title: string;
  subtitle?: string;
  variant?: 'primary' | 'secondary';
};

type AppButtonProps = AppButtonBaseProps &
  ({ href: Href; disabled?: false } | { href?: never; disabled: true });

export function AppButton(props: AppButtonProps) {
  const { title, subtitle, variant = 'secondary' } = props;
  const isPrimary = variant === 'primary';
  const disabled = props.disabled === true;

  const button = (
    <Pressable
      accessibilityRole={disabled ? 'button' : 'link'}
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={styles.button}>
      {({ pressed }) => (
        <View
          style={[
            styles.buttonContent,
            disabled ? styles.disabled : isPrimary ? styles.primary : styles.secondary,
            pressed && !disabled && (isPrimary ? styles.primaryPressed : styles.secondaryPressed),
          ]}>
          <View style={styles.labelContainer}>
            <Text
              style={[
                styles.title,
                disabled
                  ? styles.disabledText
                  : isPrimary
                    ? styles.primaryText
                    : styles.secondaryText,
              ]}>
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={[
                  styles.subtitle,
                  disabled
                    ? styles.disabledText
                    : isPrimary
                      ? styles.primarySubtitle
                      : styles.secondaryText,
                ]}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {!disabled ? (
            <Text
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[styles.arrow, isPrimary ? styles.primaryText : styles.secondaryText]}>
              →
            </Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );

  if (props.disabled) {
    return button;
  }

  return (
    <Link href={props.href} asChild>
      {button}
    </Link>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 72,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonContent: {
    minHeight: 72,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  primaryPressed: {
    backgroundColor: colors.primaryPressed,
    borderColor: colors.primaryPressed,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  secondaryPressed: {
    backgroundColor: colors.primarySoft,
  },
  disabled: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  labelContainer: {
    flex: 1,
  },
  title: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 21,
  },
  primaryText: {
    color: colors.surface,
  },
  primarySubtitle: {
    color: '#E5EEE9',
  },
  secondaryText: {
    color: colors.text,
  },
  disabledText: {
    color: colors.textMuted,
  },
  arrow: {
    minWidth: layout.minimumTouchTarget / 2,
    fontSize: 26,
    textAlign: 'right',
  },
});
