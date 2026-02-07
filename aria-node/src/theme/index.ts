/**
 * Aria Node — Cyberpunk Theme
 * Dark, glowing, minimal. Like the AI that lives inside it.
 */
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  // Core
  background: '#0a0a14',
  surface: '#12122a',
  surfaceLight: '#1a1a3e',
  surfaceBorder: '#252550',

  // Brand
  cyan: '#00d4ff',
  cyanDim: '#00d4ff40',
  cyanGlow: '#00d4ff20',
  purple: '#8b5cf6',
  purpleDim: '#8b5cf640',
  magenta: '#ff006e',
  magentaDim: '#ff006e40',

  // Status
  success: '#00ff88',
  successDim: '#00ff8840',
  warning: '#ffaa00',
  warningDim: '#ffaa0040',
  error: '#ff4444',
  errorDim: '#ff444440',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#8888aa',
  textMuted: '#555577',

  // Overlay
  overlay: '#0a0a14cc',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 28,
  hero: 36,
};

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

// Glow shadow factory
export const glow = (color: string, intensity: number = 1): ViewStyle => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.6 * intensity,
  shadowRadius: 12 * intensity,
  elevation: 8 * intensity,
});

// Common styles
export const common = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  centered: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  textMono: {
    fontFamily: 'monospace',
    fontSize: fontSize.sm,
    color: colors.success,
  },
});
