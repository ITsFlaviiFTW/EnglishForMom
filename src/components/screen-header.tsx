import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { layout } from '@/constants/layout';
import { colors, radii } from '@/constants/theme';

type ScreenHeaderProps = {
  title: string;
  description?: string;
  showHomeLink?: boolean;
  backHref?: Href;
  backLabel?: string;
};

export function ScreenHeader({
  title,
  description,
  showHomeLink = true,
  backHref = '/',
  backLabel = 'Acasă',
}: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      {showHomeLink ? <BackButton href={backHref} label={backLabel} /> : null}
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

export function BackButton({ href, label }: { href: Href; label: string }) {
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityLabel={`Înapoi: ${label}`}
        accessibilityRole="button"
        hitSlop={8}
        style={styles.backPressable}>
        {({ pressed }) => (
          <View style={[styles.backButton, pressed && styles.backButtonPressed]}>
            <Text style={styles.backChevron}>‹</Text>
            <Text style={styles.backText}>{label}</Text>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: layout.sectionGap,
  },
  backPressable: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    marginBottom: 20,
  },
  backButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderColor: colors.border,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 18,
  },
  backButtonPressed: {
    backgroundColor: colors.primarySoft,
  },
  backChevron: {
    color: colors.primary,
    fontSize: 30,
    lineHeight: 32,
    fontWeight: '500',
    marginTop: -3,
  },
  backText: {
    color: colors.primary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  description: {
    color: colors.textMuted,
    fontSize: 19,
    lineHeight: 28,
    marginTop: 8,
  },
});
