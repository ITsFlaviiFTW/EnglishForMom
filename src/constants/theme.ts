/**
 * Prava colour system: warm paper background, white cards, one deep green for
 * every main action. Text colours keep at least 4.5:1 contrast on both the
 * background and the cards.
 */
export const colors = {
  background: '#F5F0E8',
  surface: '#FFFFFF',
  surfaceMuted: '#EFE8DC',
  text: '#1A2420',
  textMuted: '#56625C',
  primary: '#1E5A45',
  primaryPressed: '#164536',
  primarySoft: '#E2EEE7',
  onPrimary: '#FFFFFF',
  onPrimaryMuted: '#D3E6DC',
  border: '#E3DACB',
  borderStrong: '#B9AE9C',
  disabled: '#9AA39E',
  success: '#22683F',
  successSoft: '#E1F1E6',
  error: '#A33A2B',
  errorSoft: '#FBE7E2',
  warm: '#9C5226',
  warmSoft: '#F8E9DC',
} as const;

export const radii = {
  small: 12,
  medium: 16,
  large: 22,
  pill: 999,
} as const;

export const shadows = {
  card: '0px 1px 2px rgba(48, 36, 20, 0.06), 0px 8px 24px rgba(48, 36, 20, 0.07)',
  raised: '0px 2px 4px rgba(20, 60, 45, 0.12), 0px 10px 28px rgba(20, 60, 45, 0.18)',
  footer: '0px -6px 20px rgba(48, 36, 20, 0.06)',
} as const;
