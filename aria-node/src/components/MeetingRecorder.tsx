import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, spacing, fontSize, borderRadius, glow } from '../theme';
import { GlowButton } from './GlowButton';
import { MeetingState } from '../services/meeting';

interface MeetingRecorderProps {
  state: MeetingState;
  onStart: () => void;
  onStop: () => void;
}

export function MeetingRecorder({ state, onStart, onStop }: MeetingRecorderProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state.isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state.isRecording, pulseAnim]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {state.isRecording && (
        <View style={styles.recordingInfo}>
          <Animated.View style={[styles.recDot, { opacity: pulseAnim }]} />
          <Text style={styles.recTime}>{formatTime(state.elapsedMs)}</Text>
          <Text style={styles.recChunks}>{state.chunksTotal} chunks</Text>
        </View>
      )}

      {state.status === 'processing' && (
        <View style={styles.statusRow}>
          <Text style={styles.statusIcon}>⏳</Text>
          <Text style={styles.statusText}>Processing {state.chunksTotal} chunks...</Text>
        </View>
      )}

      {state.status === 'done' && (
        <View style={styles.statusRow}>
          <Text style={styles.statusIcon}>✅</Text>
          <Text style={[styles.statusText, { color: colors.success }]}>
            Summary sent to Slack
          </Text>
        </View>
      )}

      {state.status === 'error' && (
        <View style={styles.statusRow}>
          <Text style={styles.statusIcon}>❌</Text>
          <Text style={[styles.statusText, { color: colors.error }]}>
            {state.error || 'Recording failed'}
          </Text>
        </View>
      )}

      <GlowButton
        title={state.isRecording ? 'Stop & Process' : 'Record Meeting'}
        icon={state.isRecording ? '⏹️' : '📋'}
        color={state.isRecording ? colors.error : colors.purple}
        onPress={state.isRecording ? onStop : onStart}
        size="medium"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.errorDim,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  recDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  recTime: {
    fontFamily: 'monospace',
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.error,
  },
  recChunks: {
    fontFamily: 'monospace',
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: 'auto',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusIcon: {
    fontSize: fontSize.md,
  },
  statusText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
