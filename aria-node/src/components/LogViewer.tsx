import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme';

interface LogViewerProps {
  logs: string[];
  onClear?: () => void;
  maxHeight?: number;
}

export function LogViewer({ logs, onClear, maxHeight = 200 }: LogViewerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{'>'} SYSTEM LOG</Text>
        {onClear && (
          <TouchableOpacity onPress={onClear}>
            <Text style={styles.clearBtn}>CLEAR</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        style={[styles.scroll, { maxHeight }]}
        nestedScrollEnabled={true}
      >
        {logs.map((log, i) => (
          <Text key={i} style={styles.logLine}>
            {log}
          </Text>
        ))}
        {logs.length === 0 && (
          <Text style={styles.emptyText}>Awaiting input...</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#06060e',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  title: {
    fontFamily: 'monospace',
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 2,
    fontWeight: '700',
  },
  clearBtn: {
    fontFamily: 'monospace',
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  scroll: {
    padding: spacing.sm,
  },
  logLine: {
    fontFamily: 'monospace',
    fontSize: fontSize.xs,
    color: colors.success,
    lineHeight: 18,
    marginBottom: 2,
  },
  emptyText: {
    fontFamily: 'monospace',
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
