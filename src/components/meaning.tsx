import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/theme';

/**
 * What it means, in Romanian: dark, bold text beside a green bar, so it is
 * easy to find on the card (and does not look like a button).
 */
export function Meaning({
  text,
  size = 'large',
  style,
}: {
  text: string;
  size?: 'large' | 'compact';
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.meaning, style]}>
      <Text style={[styles.text, size === 'compact' && styles.compact]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  meaning: {
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
    borderRadius: 2,
    paddingLeft: 14,
    paddingVertical: 2,
  },
  text: {
    color: colors.text,
    fontSize: 23,
    lineHeight: 30,
    fontWeight: '700',
  },
  compact: {
    fontSize: 20,
    lineHeight: 27,
  },
});
