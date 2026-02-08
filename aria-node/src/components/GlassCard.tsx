import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, spacing, borderRadius } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  borderGlow?: string;
  noPadding?: boolean;
}

export function GlassCard({
  children,
  style,
  intensity = 40,
  borderGlow,
  noPadding = false,
}: GlassCardProps) {
  const borderColor = borderGlow
    ? borderGlow + '60'
    : colors.surfaceBorder;

  // BlurView works on iOS; on Android/web we fall back to semi-transparent bg
  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.outerContainer, { borderColor }, style]}>
        <BlurView
          intensity={intensity}
          tint="dark"
          style={[styles.blurView, !noPadding && styles.padding]}
        >
          {children}
        </BlurView>
      </View>
    );
  }

  // Android / Web fallback
  return (
    <View
      style={[
        styles.outerContainer,
        styles.fallbackBg,
        !noPadding && styles.padding,
        { borderColor },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  blurView: {
    overflow: 'hidden',
  },
  fallbackBg: {
    backgroundColor: 'rgba(12, 12, 30, 0.75)',
  },
  padding: {
    padding: spacing.lg,
  },
});
