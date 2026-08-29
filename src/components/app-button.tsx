import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { layout } from '@/constants/layout';
import { colors } from '@/constants/theme';

type AppButtonProps = {
  href: Href;
  title: string;
  subtitle?: string;
  variant?: 'primary' | 'secondary';
};

export function AppButton({ href, title, subtitle, variant = 'secondary' }: AppButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" style={styles.button}>
        {({ pressed }) => (
          <View
            style={[
              styles.buttonContent,
              isPrimary ? styles.primary : styles.secondary,
              pressed && (isPrimary ? styles.primaryPressed : styles.secondaryPressed),
            ]}>
            <View style={styles.labelContainer}>
              <Text style={[styles.title, isPrimary ? styles.primaryText : styles.secondaryText]}>
                {title}
              </Text>
              {subtitle ? (
                <Text
                  style={[
                    styles.subtitle,
                    isPrimary ? styles.primarySubtitle : styles.secondaryText,
                  ]}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
            <Text
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[styles.arrow, isPrimary ? styles.primaryText : styles.secondaryText]}>
              →
            </Text>
          </View>
        )}
      </Pressable>
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
  arrow: {
    minWidth: layout.minimumTouchTarget / 2,
    fontSize: 26,
    textAlign: 'right',
  },
});
