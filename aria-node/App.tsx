import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  AppState,
  AppStateStatus,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { gateway } from './src/services/gateway';
import { locationService } from './src/services/location';
import { cameraService } from './src/services/camera';
import { micService } from './src/services/mic';
import { commandHandler, CameraCaptureCallback, ScreenDisplayCallback } from './src/services/commands';
import { audioService, AudioState } from './src/services/audio';
import { backgroundService } from './src/services/background';
import { meetingService, MeetingState } from './src/services/meeting';
import { CameraSnapParams } from './src/types/protocol';
import { colors, spacing, fontSize, borderRadius, glow, common } from './src/theme';
import { GlowButton } from './src/components/GlowButton';
import { GlassCard } from './src/components/GlassCard';
import { CircuitBackground } from './src/components/CircuitBackground';
import { CoreOrb } from './src/components/CoreOrb';
import { NowPlayingCard, NowPlayingData } from './src/components/NowPlayingCard';
import { MeetingRecorder } from './src/components/MeetingRecorder';
import { LogViewer } from './src/components/LogViewer';

const APP_VERSION = '1.1.0';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Screen = 'home' | 'settings' | 'nowplaying';
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'pairing';

// Map connection state to background glow intensity
const glowMap: Record<ConnectionState, number> = {
  disconnected: 0.15,
  connecting: 0.4,
  pairing: 0.4,
  connected: 0.7,
};

export default function App() {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  // Connection
  const [host, setHost] = useState('');
  const [port, setPort] = useState('18789');
  const [token, setToken] = useState('');
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [logs, setLogs] = useState<string[]>([]);

  // Camera
  const [cameraReady, setCameraReady] = useState(false);
  const [pendingCapture, setPendingCapture] = useState<{
    facing: 'front' | 'back';
    params: CameraSnapParams;
    resolve: (result: { base64: string; width: number; height: number }) => void;
    reject: (error: Error) => void;
  } | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  // Permissions
  const [locationPermission, setLocationPermission] = useState(false);
  const [micPermission, setMicPermission] = useState(false);

  // State
  const [isRecording, setIsRecording] = useState(false);
  const [backgroundActive, setBackgroundActive] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null);
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [meetingState, setMeetingState] = useState<MeetingState>({
    isRecording: false, startedAt: null, elapsedMs: 0,
    chunksSent: 0, chunksTotal: 0, status: 'idle',
  });

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 99)]);
  }, []);

  // ─── Initialize services ───
  useEffect(() => {
    const init = async () => {
      try {
        await gateway.initialize();

        const settings = gateway.getSettings();
        if (settings.host) setHost(settings.host);
        if (settings.port) setPort(settings.port.toString());
        if (settings.token) setToken(settings.token);

        gateway.onStateChange((state) => {
          setConnectionState(state);
          addLog(`State: ${state}`);
        });
        setConnectionState(gateway.getState());

        gateway.onLog((message) => addLog(`[GW] ${message}`));
        gateway.onMessage((message) => {
          if (message.type === 'event') addLog(`Event: ${message.event}`);
        });

        const camPerm = await cameraService.checkPermission();
        const locPerm = await locationService.checkPermission();
        setLocationPermission(locPerm);
        const micPerm = await micService.checkPermission();
        setMicPermission(micPerm);

        gateway.setInvokeHandler(async (command, params) => {
          addLog(`⚡ ${command}`);
          return await commandHandler.handle(command, params);
        });

        commandHandler.setScreenDisplayCallback((data) => {
          if (data) {
            setNowPlaying({
              title: data.title || 'Unknown',
              subtitle: data.subtitle,
              imageUrl: data.imageUrl,
              duration: data.duration,
              isPlaying: data.isPlaying,
            });
            addLog(`🎵 Display: ${data.title || 'unknown'}`);
          } else {
            setNowPlaying(null);
          }
        });

        audioService.onStateChange((state) => {
          setAudioState(state);
          if (state === 'idle') {
            setNowPlaying((prev) => prev ? { ...prev, isPlaying: false } : null);
          }
        });

        meetingService.onLog((msg) => addLog(msg));
        meetingService.onStateChange((state) => setMeetingState(state));
        backgroundService.onLog((msg) => addLog(msg));
        backgroundService.setReconnectCallback(() => {
          if (gateway.getState() === 'disconnected' && gateway.getSettings().host) {
            addLog('Reconnecting...');
            gateway.connect();
          }
        });

        addLog('⚡ Aria Node v' + APP_VERSION + ' ready');
      } catch (error) {
        addLog('❌ INIT: ' + (error instanceof Error ? error.message : String(error)));
      }
    };
    init();
  }, [addLog]);

  // Sync connection state
  useEffect(() => {
    const interval = setInterval(() => setConnectionState(gateway.getState()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Camera capture handler
  useEffect(() => {
    const captureCallback: CameraCaptureCallback = async (facing, params) => {
      return new Promise((resolve, reject) => {
        if (!cameraReady) { reject(new Error('NODE_BACKGROUND_UNAVAILABLE')); return; }
        setPendingCapture({ facing, params, resolve, reject });
      });
    };
    commandHandler.setCameraCaptureCallback(captureCallback);
  }, [cameraReady]);

  // Process camera capture
  useEffect(() => {
    const capture = async () => {
      if (!pendingCapture || !cameraRef.current) return;
      try {
        if (pendingCapture.params.delayMs) {
          await new Promise((r) => setTimeout(r, pendingCapture.params.delayMs));
        }
        const photo = await cameraRef.current.takePictureAsync({
          quality: pendingCapture.params.quality || 0.9,
          base64: true, exif: false,
        });
        if (photo?.base64) {
          pendingCapture.resolve({ base64: photo.base64, width: photo.width, height: photo.height });
          addLog(`📸 ${photo.width}x${photo.height}`);
        } else {
          pendingCapture.reject(new Error('Capture failed'));
        }
      } catch (error) {
        pendingCapture.reject(error instanceof Error ? error : new Error('Capture failed'));
      } finally {
        setPendingCapture(null);
      }
    };
    capture();
  }, [pendingCapture, addLog]);

  // App state
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      setCameraReady(state === 'active');
    });
    return () => sub.remove();
  }, []);

  // ─── Actions ───
  const handleConnect = () => {
    if (!host || !token) { Alert.alert('Missing', 'Enter host and token'); return; }
    gateway.setGateway(host, parseInt(port, 10), token);
    gateway.connect();
  };

  const handleDisconnect = () => gateway.disconnect();

  const requestPermissions = async () => {
    try {
      const camResult = await requestCameraPermission();
      if (camResult.granted) await cameraService.checkPermission();
      const locResult = await locationService.requestPermission(true);
      setLocationPermission(locResult);
      const micResult = await micService.requestPermission();
      setMicPermission(micResult);
      addLog('Permissions updated');
    } catch (error) {
      addLog(`Permission error: ${error}`);
    }
  };

  const sendToAria = async (result: { base64: string; format?: string; durationMs?: number }) => {
    addLog('📤 Sending to Aria...');
    const voiceEndpoints = [
      'https://aria-palace.tail7b3df7.ts.net/voice/voice',
      'http://100.122.162.33:9999/voice',
      'http://192.168.0.194:9999/voice',
    ];
    const body = JSON.stringify({
      audio: result.base64,
      format: result.format || 'm4a',
      durationMs: result.durationMs,
    });
    for (const endpoint of voiceEndpoints) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const data = await response.json();
        if (data.ok) {
          addLog(`✅ "${data.transcript}"`);
        } else {
          addLog(`⚠️ ${data.error}`);
        }
        return;
      } catch {
        continue;
      }
    }
    addLog('❌ All voice endpoints failed');
  };

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      micService.stop();
    } else {
      setIsRecording(true);
      const result = await micService.record({ maxDurationMs: 60000 });
      setIsRecording(false);
      if (result.recorded && result.base64) {
        addLog(`✅ ${Math.round((result.durationMs || 0) / 1000)}s recorded`);
        await sendToAria({ base64: result.base64, format: result.format, durationMs: result.durationMs });
      } else {
        addLog(`❌ ${result.error}`);
      }
    }
  };

  // ─── HOME SCREEN ───
  const renderHomeScreen = () => (
    <CircuitBackground glowIntensity={glowMap[connectionState]}>
      <ScrollView
        style={styles.screenScroll}
        contentContainerStyle={styles.homeContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Central Core Orb */}
        <View style={styles.orbSection}>
          <CoreOrb state={connectionState} version={APP_VERSION} />
        </View>

        {/* Now Playing Card (if active) */}
        {nowPlaying && (
          <View style={styles.cardSection}>
            <GlassCard borderGlow={colors.cyan}>
              <TouchableOpacity
                onPress={() => setCurrentScreen('nowplaying')}
                activeOpacity={0.8}
              >
                <NowPlayingCard
                  data={nowPlaying}
                  audioState={audioState}
                  onPress={() => setCurrentScreen('nowplaying')}
                />
              </TouchableOpacity>
            </GlassCard>
          </View>
        )}

        {/* Main Action: Talk to Aria */}
        <View style={styles.actionSection}>
          <GlowButton
            title={isRecording ? '⏹  STOP & SEND' : '🎤  TALK TO ARIA'}
            color={isRecording ? colors.error : colors.cyan}
            onPress={toggleRecording}
            size="hero"
            style={styles.heroButton}
          />
        </View>

        {/* Action Grid */}
        <View style={styles.gridSection}>
          <View style={styles.gridRow}>
            <GlowButton
              title="Meeting"
              icon="📋"
              color={meetingState.isRecording ? colors.error : colors.purple}
              onPress={async () => {
                if (meetingState.isRecording) {
                  await meetingService.stopRecording();
                } else {
                  if (!backgroundActive) {
                    await backgroundService.start();
                    setBackgroundActive(true);
                  }
                  await meetingService.startRecording();
                }
              }}
              size="medium"
              style={styles.gridButton}
            />
            <GlowButton
              title={backgroundActive ? 'BG: ON' : 'BG: OFF'}
              icon={backgroundActive ? '🟢' : '⭘'}
              color={backgroundActive ? colors.success : colors.textMuted}
              onPress={async () => {
                if (backgroundActive) {
                  await backgroundService.stop();
                  setBackgroundActive(false);
                } else {
                  await backgroundService.start();
                  setBackgroundActive(true);
                }
              }}
              size="medium"
              style={styles.gridButton}
            />
          </View>
          <View style={styles.gridRow}>
            <GlowButton
              title="Settings"
              icon="⚙️"
              color={colors.textSecondary}
              onPress={() => setCurrentScreen('settings')}
              size="medium"
              style={styles.gridButton}
            />
            <GlowButton
              title="Location"
              icon="📍"
              color={colors.warning}
              onPress={async () => {
                try {
                  const result = await locationService.getLocation({ desiredAccuracy: 'balanced' });
                  addLog(`📍 ${result.lat.toFixed(4)}, ${result.lon.toFixed(4)}`);
                } catch (error) {
                  addLog(`📍 Error: ${error}`);
                }
              }}
              size="medium"
              style={styles.gridButton}
            />
          </View>
        </View>

        {/* Meeting Recording Status (if active) */}
        {meetingState.status !== 'idle' && (
          <View style={styles.cardSection}>
            <GlassCard borderGlow={colors.error}>
              <MeetingRecorder
                state={meetingState}
                onStart={async () => {
                  if (!backgroundActive) {
                    await backgroundService.start();
                    setBackgroundActive(true);
                  }
                  await meetingService.startRecording();
                }}
                onStop={() => meetingService.stopRecording()}
              />
            </GlassCard>
          </View>
        )}

        {/* System Log */}
        <View style={[styles.cardSection, { marginBottom: spacing.xxl * 2 }]}>
          <GlassCard noPadding borderGlow={colors.success}>
            <LogViewer
              logs={logs}
              onClear={() => setLogs([])}
              maxHeight={150}
            />
          </GlassCard>
        </View>
      </ScrollView>
    </CircuitBackground>
  );

  // ─── SETTINGS SCREEN ───
  const renderSettingsScreen = () => (
    <CircuitBackground glowIntensity={0.2}>
      <ScrollView
        style={styles.screenScroll}
        contentContainerStyle={styles.settingsContent}
      >
        {/* Header */}
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>SETTINGS</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Gateway Connection */}
        <View style={styles.cardSection}>
          <GlassCard borderGlow={colors.cyan}>
            <Text style={styles.cardTitle}>Gateway Connection</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 3 }]}
                placeholder="Host (IP or hostname)"
                placeholderTextColor={colors.textMuted}
                value={host}
                onChangeText={setHost}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Port"
                placeholderTextColor={colors.textMuted}
                value={port}
                onChangeText={setPort}
                keyboardType="numeric"
              />
            </View>
            <TextInput
              style={[styles.input, { marginTop: spacing.sm }]}
              placeholder="Gateway Token"
              placeholderTextColor={colors.textMuted}
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            <View style={{ marginTop: spacing.md }}>
              {connectionState === 'disconnected' ? (
                <GlowButton title="Connect" icon="🔌" color={colors.cyan} onPress={handleConnect} />
              ) : (
                <GlowButton title="Disconnect" icon="⛓️‍💥" color={colors.error} onPress={handleDisconnect} />
              )}
            </View>
          </GlassCard>
        </View>

        {/* Permissions */}
        <View style={styles.cardSection}>
          <GlassCard borderGlow={colors.purple}>
            <Text style={styles.cardTitle}>Permissions</Text>
            <PermissionRow label="Camera" granted={!!cameraPermission?.granted} />
            <PermissionRow label="Location" granted={locationPermission} detail={locationService.getMode()} />
            <PermissionRow label="Microphone" granted={micPermission} />
            <View style={{ marginTop: spacing.md }}>
              <GlowButton title="Request All" icon="🔑" color={colors.purple} onPress={requestPermissions} />
            </View>
          </GlassCard>
        </View>

        {/* Danger Zone */}
        <View style={styles.cardSection}>
          <GlassCard borderGlow={colors.error}>
            <Text style={[styles.cardTitle, { color: colors.error }]}>Danger Zone</Text>
            <GlowButton
              title="Reset Pairing"
              icon="🔄"
              color={colors.warning}
              onPress={async () => {
                await gateway.resetPairing();
                addLog('Pairing reset');
                Alert.alert('Reset', 'Device ID regenerated. Reconnect to pair.');
              }}
            />
          </GlassCard>
        </View>

        {/* About */}
        <View style={[styles.cardSection, { marginBottom: spacing.xxl * 2 }]}>
          <GlassCard>
            <Text style={styles.cardTitle}>About</Text>
            <Text style={styles.aboutText}>Aria Node v{APP_VERSION}</Text>
            <Text style={styles.aboutText}>Circuit Board Edition ⚡</Text>
            <Text style={[styles.aboutText, { color: colors.textMuted, marginTop: spacing.sm }]}>
              Extending Aria's senses to the physical world.
            </Text>
          </GlassCard>
        </View>
      </ScrollView>
    </CircuitBackground>
  );

  // ─── NOW PLAYING SCREEN ───
  const renderNowPlayingScreen = () => (
    <CircuitBackground glowIntensity={nowPlaying?.isPlaying ? 0.8 : 0.4}>
      {/* Header */}
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>NOW PLAYING</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={[common.centered, { flex: 1, paddingBottom: spacing.xxl }]}>
        {nowPlaying ? (
          <NowPlayingCard
            data={nowPlaying}
            expanded
            audioState={audioState}
            onPlayPause={() => audioService.togglePlayPause()}
            onStop={async () => {
              await audioService.stop();
              setNowPlaying(null);
            }}
          />
        ) : (
          <View style={common.centered}>
            <Text style={{ fontSize: 48, marginBottom: spacing.md }}>🎵</Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.lg }}>Nothing playing</Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs }}>
              Ask Aria to play something
            </Text>
          </View>
        )}
      </View>
    </CircuitBackground>
  );

  return (
    <SafeAreaView style={common.screen}>
      <StatusBar style="light" translucent />

      {/* Hidden camera for captures */}
      {cameraPermission?.granted && (
        <View style={styles.hiddenCamera}>
          <CameraView
            ref={cameraRef}
            style={{ width: 1, height: 1 }}
            facing={pendingCapture?.facing || 'front'}
            onCameraReady={() => setCameraReady(true)}
          />
        </View>
      )}

      {/* Screen Router */}
      {currentScreen === 'home' && renderHomeScreen()}
      {currentScreen === 'settings' && renderSettingsScreen()}
      {currentScreen === 'nowplaying' && renderNowPlayingScreen()}
    </SafeAreaView>
  );
}

// ─── Permission Row Component ───
function PermissionRow({ label, granted, detail }: { label: string; granted: boolean; detail?: string }) {
  return (
    <View style={styles.permRow}>
      <Text style={styles.permLabel}>{label}</Text>
      <Text style={[styles.permStatus, { color: granted ? colors.success : colors.error }]}>
        {granted ? (detail ? `✓ ${detail}` : '✓ Granted') : '✗ Denied'}
      </Text>
    </View>
  );
}

// ─── Styles ───
const styles = StyleSheet.create({
  screenScroll: {
    flex: 1,
  },
  homeContent: {
    paddingBottom: spacing.xxl,
  },
  settingsContent: {
    paddingBottom: spacing.xxl,
  },

  // Core Orb section
  orbSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },

  // Action section
  actionSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  heroButton: {
    paddingVertical: spacing.lg,
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
  },

  // Grid
  gridSection: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  gridButton: {
    flex: 1,
    backgroundColor: 'rgba(12, 12, 30, 0.6)',
  },

  // Cards
  cardSection: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },

  // Screen headers
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(37, 37, 80, 0.5)',
  },
  backButton: {
    color: colors.cyan,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  screenTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '700',
    letterSpacing: 3,
    fontFamily: 'monospace',
  },

  // Inputs
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    backgroundColor: 'rgba(10, 10, 20, 0.6)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: fontSize.md,
  },

  // Permissions
  permRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(37, 37, 80, 0.3)',
  },
  permLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  permStatus: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    fontFamily: 'monospace',
  },

  // About
  aboutText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },

  // Hidden camera
  hiddenCamera: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
