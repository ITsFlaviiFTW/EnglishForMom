import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, shadows } from '@/constants/theme';

type AppButtonBaseProps = {
  title: string;
  subtitle?: string;
  /** A short symbol or emoji shown in a round tile on the left. */
  icon?: string;
  /** Small highlighted label on the right, e.g. a count. */
  badge?: string;
  badgeTone?: 'warm' | 'success';
  variant?: 'primary' | 'secondary';
};

type AppButtonProps = AppButtonBaseProps &
  ({ href: Href; disabled?: false } | { href?: never; disabled: true });

/** A large tappable row that opens another screen. */
export function AppButton(props: AppButtonProps) {
  const { title, subtitle, icon, badge, badgeTone = 'warm', variant = 'secondary' } = props;
  const disabled = props.disabled === true;
  const isPrimary = variant === 'primary' && !disabled;

  const button = (
    <Pressable
      accessibilityRole={disabled ? 'button' : 'link'}
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={styles.pressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.row,
            disabled ? styles.disabled : isPrimary ? styles.primary : styles.secondary,
            pressed && !disabled && (isPrimary ? styles.primaryPressed : styles.secondaryPressed),
          ]}>
          {icon ? (
            <View
              style={[
                styles.iconTile,
                isPrimary ? styles.iconTilePrimary : disabled ? styles.iconTileDisabled : null,
              ]}>
              <Text style={[styles.icon, disabled && styles.iconDisabled]}>{icon}</Text>
            </View>
          ) : null}
          <View style={styles.labels}>
            <Text
              style={[
                styles.title,
                isPrimary ? styles.onPrimary : disabled ? styles.mutedText : styles.text,
              ]}>
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={[
                  styles.subtitle,
                  isPrimary ? styles.onPrimaryMuted : styles.mutedText,
                ]}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {badge ? (
            <View
              style={[
                styles.badge,
                badgeTone === 'success' && styles.badgeSuccess,
                isPrimary && styles.badgeOnPrimary,
              ]}>
              <Text
                style={[
                  styles.badgeText,
                  badgeTone === 'success' && styles.badgeTextSuccess,
                  isPrimary && styles.badgeTextOnPrimary,
                ]}>
                {badge}
              </Text>
            </View>
          ) : null}
          {!disabled ? (
            <Text
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[styles.chevron, isPrimary ? styles.onPrimary : styles.chevronMuted]}>
              ›
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
  pressable: {
    borderRadius: radii.large,
  },
  row: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: radii.large,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  primary: {
    backgroundColor: colors.primary,
    boxShadow: shadows.raised,
  },
  primaryPressed: {
    backgroundColor: colors.primaryPressed,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    boxShadow: shadows.card,
  },
  secondaryPressed: {
    backgroundColor: colors.primarySoft,
  },
  disabled: {
    backgroundColor: colors.surfaceMuted,
  },
  iconTile: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  iconTilePrimary: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  iconTileDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  icon: {
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  iconDisabled: {
    opacity: 0.55,
  },
  labels: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  text: {
    color: colors.text,
  },
  mutedText: {
    color: colors.textMuted,
  },
  onPrimary: {
    color: colors.onPrimary,
  },
  onPrimaryMuted: {
    color: colors.onPrimaryMuted,
  },
  badge: {
    minWidth: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.warmSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  badgeSuccess: {
    backgroundColor: colors.successSoft,
  },
  badgeTextSuccess: {
    color: colors.success,
  },
  badgeOnPrimary: {
    backgroundColor: colors.onPrimary,
  },
  badgeText: {
    color: colors.warm,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  badgeTextOnPrimary: {
    color: colors.primary,
  },
  chevron: {
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '400',
    marginTop: -4,
  },
  chevronMuted: {
    color: colors.borderStrong,
  },
});
