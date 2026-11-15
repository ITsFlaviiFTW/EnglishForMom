import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, shadows } from '@/constants/theme';

type AppCardProps = PropsWithChildren<{
  eyebrow?: string;
  title?: string;
  description?: string;
  style?: StyleProp<ViewStyle>;
}>;

export function AppCard({ eyebrow, title, description, children, style }: AppCardProps) {
  return (
    <View style={[styles.card, style]}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {children ? (
        <View style={title || description || eyebrow ? styles.content : undefined}>{children}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.large,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 22,
    boxShadow: shadows.card,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '700',
  },
  description: {
    color: colors.textMuted,
    fontSize: 18,
    lineHeight: 27,
    marginTop: 6,
  },
  content: {
    marginTop: 16,
  },
});
