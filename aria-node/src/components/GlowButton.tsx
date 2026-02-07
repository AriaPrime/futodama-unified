import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { colors, spacing, fontSize, borderRadius, glow } from '../theme';

interface GlowButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large' | 'hero';
  style?: ViewStyle;
}

export function GlowButton({
  title,
  onPress,
  color = colors.cyan,
  icon,
  disabled = false,
  loading = false,
  size = 'medium',
  style,
}: GlowButtonProps) {
  const sizeStyles = {
    small: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
    medium: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
    large: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
    hero: { paddingVertical: spacing.xl, paddingHorizontal: spacing.xxl },
  };

  const fontSizes = {
    small: fontSize.sm,
    medium: fontSize.md,
    large: fontSize.lg,
    hero: fontSize.xl,
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        sizeStyles[size],
        {
          backgroundColor: disabled ? colors.surfaceLight : color + '20',
          borderColor: disabled ? colors.surfaceBorder : color,
        },
        !disabled && glow(color, 0.5),
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={color} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            {
              fontSize: fontSizes[size],
              color: disabled ? colors.textMuted : color,
            },
          ]}
        >
          {icon ? `${icon}  ${title}` : title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
