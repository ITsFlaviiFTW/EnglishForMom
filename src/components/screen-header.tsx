import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { layout } from '@/constants/layout';
import { colors } from '@/constants/theme';

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
  backLabel = '← Acasă',
}: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      {showHomeLink ? (
        <Link href={backHref} asChild>
          <Pressable accessibilityRole="button" style={styles.homeLink}>
            <Text style={styles.homeLinkText}>{backLabel}</Text>
          </Pressable>
        </Link>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingBottom: layout.sectionGap,
  },
  homeLink: {
    minHeight: layout.minimumTouchTarget,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    marginBottom: 12,
  },
  homeLinkText: {
    color: colors.primary,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700',
  },
  description: {
    color: colors.textMuted,
    fontSize: 18,
    lineHeight: 27,
    marginTop: 10,
  },
});
