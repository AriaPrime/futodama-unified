import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, spacing, fontSize, glow } from '../theme';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'pairing';

interface CoreOrbProps {
  state: ConnectionState;
  version?: string;
}

const stateConfig = {
  connected: {
    color: colors.cyan,
    label: 'LINKED',
    glowIntensity: 1.2,
    ringColor: colors.cyan,
  },
  connecting: {
    color: colors.warning,
    label: 'SYNCING',
    glowIntensity: 0.8,
    ringColor: colors.warning,
  },
  pairing: {
    color: colors.purple,
    label: 'PAIRING',
    glowIntensity: 0.8,
    ringColor: colors.purple,
  },
  disconnected: {
    color: colors.textMuted,
    label: 'OFFLINE',
    glowIntensity: 0.2,
    ringColor: colors.textMuted,
  },
};

export function CoreOrb({ state, version }: CoreOrbProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  const config = stateConfig[state];

  useEffect(() => {
    // Pulse animation
    if (state === 'connected') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (state === 'connecting' || state === 'pairing') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.95,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      pulseAnim.stopAnimation();
    };
  }, [state, pulseAnim]);

  // Slow rotation for the outer ring
  useEffect(() => {
    if (state === 'connected' || state === 'connecting') {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: state === 'connecting' ? 4000 : 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
    return () => rotateAnim.stopAnimation();
  }, [state, rotateAnim]);

  // Glow breathing
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
    return () => glowAnim.stopAnimation();
  }, [glowAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Outer rotating ring */}
      <Animated.View
        style={[
          styles.outerRing,
          {
            borderColor: config.ringColor + '40',
            transform: [{ rotate: rotation }],
          },
        ]}
      >
        {/* Ring segment highlights */}
        <View style={[styles.ringSegment, styles.ringTop, { backgroundColor: config.ringColor + '80' }]} />
        <View style={[styles.ringSegment, styles.ringBottom, { backgroundColor: config.ringColor + '40' }]} />
      </Animated.View>

      {/* Middle glow ring */}
      <Animated.View
        style={[
          styles.middleRing,
          {
            borderColor: config.color + '60',
            opacity: glowAnim,
          },
          glow(config.color, config.glowIntensity),
        ]}
      />

      {/* Core orb */}
      <Animated.View
        style={[
          styles.core,
          {
            backgroundColor: config.color + '15',
            borderColor: config.color + '80',
            transform: [{ scale: pulseAnim }],
          },
          glow(config.color, config.glowIntensity * 0.8),
        ]}
      >
        <Text style={styles.ariaText}>⚡</Text>
        <Text style={[styles.label, { color: config.color }]}>ARIA</Text>
      </Animated.View>

      {/* Status label below */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: config.color }]} />
        <Text style={[styles.statusLabel, { color: config.color }]}>
          {config.label}
        </Text>
      </View>

      {version && (
        <Text style={styles.versionText}>NODE v{version}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  outerRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  ringSegment: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  ringTop: {
    top: -3,
    left: '50%',
    marginLeft: -3,
  },
  ringBottom: {
    bottom: -3,
    left: '50%',
    marginLeft: -3,
  },
  middleRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
  },
  core: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ariaText: {
    fontSize: 32,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '900',
    letterSpacing: 4,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  versionText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 2,
    fontFamily: 'monospace',
    marginTop: spacing.xs,
  },
});
