import { StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';

export default function HomeScreen() {
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>ENGLISH FOR MOM</Text>
        <Text style={styles.title}>Învață engleza pas cu pas.</Text>
        <Text style={styles.description}>
          Lecții practice pentru situații de zi cu zi vor fi disponibile în curând.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  eyebrow: {
    color: '#426B5A',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 16,
  },
  title: {
    color: '#1D2A25',
    fontSize: 38,
    fontWeight: '700',
    lineHeight: 46,
    marginBottom: 20,
  },
  description: {
    color: '#53615B',
    fontSize: 20,
    lineHeight: 30,
    maxWidth: 520,
  },
});
