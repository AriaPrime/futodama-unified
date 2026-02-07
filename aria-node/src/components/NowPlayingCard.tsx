import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { colors, spacing, fontSize, borderRadius, glow } from '../theme';

export interface NowPlayingData {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  duration?: string;
  isPlaying?: boolean;
}

interface NowPlayingCardProps {
  data: NowPlayingData | null;
  onPress?: () => void;
  expanded?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function NowPlayingCard({ data, onPress, expanded = false }: NowPlayingCardProps) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (data?.isPlaying) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [data?.isPlaying, glowAnim]);

  if (!data) return null;

  if (expanded) {
    return (
      <View style={styles.expandedContainer}>
        {data.imageUrl && (
          <View style={[styles.artworkContainer, glow(colors.cyan, 0.6)]}>
            <Image source={{ uri: data.imageUrl }} style={styles.artworkExpanded} />
            <View style={styles.artworkOverlay} />
          </View>
        )}
        <View style={styles.expandedInfo}>
          <Text style={styles.expandedTitle} numberOfLines={2}>
            {data.title}
          </Text>
          {data.subtitle && (
            <Text style={styles.expandedSubtitle} numberOfLines={1}>
              {data.subtitle}
            </Text>
          )}
          {data.isPlaying && (
            <Animated.View style={[styles.playingIndicator, { opacity: glowAnim }]}>
              <Text style={styles.playingBars}>▮▯▮▯▮▮▯▮</Text>
              <Text style={styles.playingText}>NOW PLAYING</Text>
            </Animated.View>
          )}
        </View>
      </View>
    );
  }

  // Mini card for home screen
  return (
    <TouchableOpacity
      style={[styles.miniCard, glow(colors.cyan, 0.3)]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {data.imageUrl && (
        <Image source={{ uri: data.imageUrl }} style={styles.miniArtwork} />
      )}
      <View style={styles.miniInfo}>
        <Text style={styles.miniTitle} numberOfLines={1}>
          {data.title}
        </Text>
        {data.subtitle && (
          <Text style={styles.miniSubtitle} numberOfLines={1}>
            {data.subtitle}
          </Text>
        )}
      </View>
      {data.isPlaying && (
        <Animated.Text style={[styles.miniPlaying, { opacity: glowAnim }]}>
          ▮▯▮
        </Animated.Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Expanded (full screen)
  expandedContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  artworkContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  artworkExpanded: {
    width: SCREEN_WIDTH - spacing.xxl * 2,
    height: (SCREEN_WIDTH - spacing.xxl * 2) * 0.56, // 16:9 ratio
    borderRadius: borderRadius.lg,
  },
  artworkOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cyanDim,
  },
  expandedInfo: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  expandedTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  expandedSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  playingBars: {
    fontSize: fontSize.sm,
    color: colors.cyan,
    letterSpacing: 2,
  },
  playingText: {
    fontSize: fontSize.xs,
    color: colors.cyan,
    fontWeight: '700',
    letterSpacing: 3,
    fontFamily: 'monospace',
  },

  // Mini card
  miniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cyanDim,
    padding: spacing.sm,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  miniArtwork: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
  },
  miniInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  miniTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  miniSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  miniPlaying: {
    fontSize: fontSize.sm,
    color: colors.cyan,
    marginLeft: spacing.sm,
    letterSpacing: 1,
  },
});
