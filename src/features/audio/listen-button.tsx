import { Pressable, StyleSheet, Text, View } from 'react-native';

import { layout } from '@/constants/layout';
import { colors } from '@/constants/theme';
import type { AudioPlaybackState } from '@/services/audio-service';

type ListenButtonProps = {
  label: string;
  state: AudioPlaybackState;
  errorMessage: string | null;
  onPress: () => void;
};

export function ListenButton({ label, state, errorMessage, onPress }: ListenButtonProps) {
  const isBusy = state === 'loading' || state === 'playing';

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel={`Ascultă pronunția în engleză pentru ${label}`}
        accessibilityRole="button"
        disabled={isBusy}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          isBusy && styles.busyButton,
          pressed && !isBusy && styles.pressedButton,
        ]}>
        <Text style={styles.icon}>🔊</Text>
        <Text style={styles.label}>{isBusy ? 'Se redă…' : 'Ascultă'}</Text>
      </Pressable>
      {errorMessage ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    gap: 8,
  },
  button: {
    minHeight: layout.minimumTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  pressedButton: {
    backgroundColor: colors.border,
  },
  busyButton: {
    borderColor: colors.disabled,
    opacity: 0.75,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    color: colors.primary,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
  },
  error: {
    color: colors.error,
    fontSize: 15,
    lineHeight: 22,
  },
});
