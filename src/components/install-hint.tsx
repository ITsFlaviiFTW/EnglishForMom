import { useState, useSyncExternalStore } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '@/constants/theme';

const DISMISSED_KEY = 'prava.installHintDismissed';

const subscribeNever = () => () => {};

function shouldOfferInstall(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent;
  const isAppleMobile =
    /iPhone|iPad|iPod/.test(userAgent) ||
    (userAgent.includes('Macintosh') && window.navigator.maxTouchPoints > 1);
  const isInstalled =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia?.('(display-mode: standalone)').matches === true;

  let dismissed = false;
  try {
    dismissed = window.localStorage.getItem(DISMISSED_KEY) === '1';
  } catch {
    dismissed = false;
  }

  return isAppleMobile && !isInstalled && !dismissed;
}

/**
 * On iPhone/iPad Safari (not yet installed), explains how to put Prava on the
 * Home Screen. Hidden everywhere else and once dismissed.
 */
export function InstallHint() {
  // The server-rendered page never shows the hint; the browser decides after loading.
  const offerInstall = useSyncExternalStore(subscribeNever, shouldOfferInstall, () => false);
  const [dismissedNow, setDismissedNow] = useState(false);

  if (!offerInstall || dismissedNow) {
    return null;
  }

  const dismiss = () => {
    setDismissedNow(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // Private browsing: the hint simply shows again next time.
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>📲 Pune Prava pe ecranul telefonului</Text>
      <Text style={styles.step}>
        1. Apasă butonul <Text style={styles.strong}>Partajează</Text> (pătratul cu săgeată ⬆︎). Dacă
        nu îl vezi, apasă întâi <Text style={styles.strong}>•••</Text>.
      </Text>
      <Text style={styles.step}>
        2. Alege <Text style={styles.strong}>„Adaugă la ecranul principal”</Text> (Add to Home
        Screen).
      </Text>
      <Text style={styles.step}>3. Apoi deschide Prava de pe ecran, ca pe orice aplicație.</Text>
      <Pressable
        accessibilityRole="button"
        hitSlop={8}
        onPress={dismiss}
        style={({ pressed }) => [styles.dismiss, pressed && styles.dismissPressed]}>
        <Text style={styles.dismissText}>Am înțeles</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    backgroundColor: colors.warmSoft,
    borderRadius: radii.large,
    padding: 18,
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '800',
    marginBottom: 2,
  },
  step: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 25,
  },
  strong: {
    fontWeight: '800',
  },
  dismiss: {
    alignSelf: 'flex-start',
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    marginTop: 6,
  },
  dismissPressed: {
    backgroundColor: colors.border,
  },
  dismissText: {
    color: colors.warm,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },
});
