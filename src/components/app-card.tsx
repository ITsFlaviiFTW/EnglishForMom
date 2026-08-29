import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

type AppCardProps = PropsWithChildren<{
  eyebrow?: string;
  title: string;
  description?: string;
}>;

export function AppCard({ eyebrow, title, description, children }: AppCardProps) {
  return (
    <View style={styles.card}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {children ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
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
    fontSize: 17,
    lineHeight: 25,
    marginTop: 8,
  },
  content: {
    marginTop: 16,
  },
});
