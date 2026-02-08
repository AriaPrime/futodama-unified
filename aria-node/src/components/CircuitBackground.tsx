import React, { useEffect, useRef } from 'react';
import { View, ImageBackground, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CircuitBackgroundProps {
  children: React.ReactNode;
  glowIntensity?: number; // 0 = dim (disconnected), 1 = full (connected)
}

export function CircuitBackground({ children, glowIntensity = 0.6 }: CircuitBackgroundProps) {
  const fadeAnim = useRef(new Animated.Value(glowIntensity)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: glowIntensity,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [glowIntensity, fadeAnim]);

  return (
    <View style={styles.container}>
      {/* Base dark layer */}
      <View style={styles.darkBase} />

      {/* Circuit board image — opacity controlled by connection state */}
      <Animated.View style={[styles.imageLayer, { opacity: fadeAnim }]}>
        <ImageBackground
          source={require('../../assets/bg-circuit-v3.png')}
          style={styles.image}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Gradient overlays for better UI readability */}
      {/* Top fade — space for status bar + header */}
      <LinearGradient
        colors={['rgba(10, 10, 20, 0.9)', 'rgba(10, 10, 20, 0.3)', 'transparent']}
        style={styles.topGradient}
        locations={[0, 0.5, 1]}
      />

      {/* Bottom fade — space for action buttons + log */}
      <LinearGradient
        colors={['transparent', 'rgba(10, 10, 20, 0.5)', 'rgba(10, 10, 20, 0.95)']}
        style={styles.bottomGradient}
        locations={[0, 0.4, 1]}
      />

      {/* Content layer */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  darkBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  imageLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.2,
    zIndex: 1,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.35,
    zIndex: 1,
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
});
