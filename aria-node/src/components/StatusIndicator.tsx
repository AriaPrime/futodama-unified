import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, spacing, fontSize, glow } from '../theme';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'pairing';

interface StatusIndicatorProps {
  state: ConnectionState;
  compact?: boolean;
}

const stateConfig = {
  connected: { color: colors.success, label: 'ONLINE', icon: '⚡' },
  connecting: { color: colors.warning, label: 'CONNECTING', icon: '◌' },
  pairing: { color: colors.purple, label: 'PAIRING', icon: '🔑' },
  disconnected: { color: colors.error, label: 'OFFLINE', icon: '○' },
};

export function StatusIndicator({ state, compact = false }: StatusIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'connected') {
      // Gentle pulse for connected state
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else if (state === 'connecting' || state === 'pairing') {
      // Faster pulse for transitional states
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state, pulseAnim]);

  const config = stateConfig[state];

  if (compact) {
    return (
      <View style={[styles.compactContainer, glow(config.color, 0.3)]}>
        <View style={[styles.dot, { backgroundColor: config.color }]} />
        <Text style={[styles.compactLabel, { color: config.color }]}>{config.label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.glowRing,
          {
            borderColor: config.color,
            opacity: pulseAnim,
          },
          glow(config.color, 0.8),
        ]}
      >
        <View style={[styles.innerDot, { backgroundColor: config.color }]} />
      </Animated.View>
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  glowRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  compactLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
