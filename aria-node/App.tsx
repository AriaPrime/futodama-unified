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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { gateway } from './src/services/gateway';
import { locationService } from './src/services/location';
import { cameraService } from './src/services/camera';
import { commandHandler, CameraCaptureCallback } from './src/services/commands';
import { CameraSnapParams } from './src/types/protocol';

const APP_VERSION = '0.1.9';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'pairing';

export default function App() {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('18789');
  const [token, setToken] = useState('');
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [logs, setLogs] = useState<string[]>([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [pendingCapture, setPendingCapture] = useState<{
    facing: 'front' | 'back';
    params: CameraSnapParams;
    resolve: (result: { base64: string; width: number; height: number }) => void;
    reject: (error: Error) => void;
  } | null>(null);

  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState(false);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 99)]);
  }, []);

  // Initialize services
  useEffect(() => {
    // Log immediately to confirm useEffect runs
    addLog('App starting...');
    
    const init = async () => {
      try {
        addLog('Initializing gateway...');
        await gateway.initialize();
        addLog('Gateway initialized OK');

        // Set up gateway event handlers FIRST
        gateway.onStateChange((state) => {
          setConnectionState(state);
          addLog(`State: ${state}`);
        });

        gateway.onLog((message) => {
          addLog(`[GW] ${message}`);
        });

        gateway.onMessage((message) => {
          if (message.type === 'event') {
            addLog(`Event: ${message.event}`);
          }
        });

        // Check permissions
        const locPerm = await locationService.checkPermission();
        setLocationPermission(locPerm);
        addLog('Permissions checked');

        // Set up command handler
        gateway.setInvokeHandler(async (command, params) => {
          addLog(`Invoke: ${command}`);
          return await commandHandler.handle(command, params);
        });
        
        addLog('Ready!');
      } catch (error) {
        addLog('INIT ERROR: ' + (error instanceof Error ? error.message : String(error)));
      }
    };

    init();
  }, [addLog]);

  // Handle camera capture callback
  useEffect(() => {
    const captureCallback: CameraCaptureCallback = async (facing, params) => {
      return new Promise((resolve, reject) => {
        if (!cameraReady) {
          reject(new Error('NODE_BACKGROUND_UNAVAILABLE'));
          return;
        }
        setPendingCapture({ facing, params, resolve, reject });
      });
    };

    commandHandler.setCameraCaptureCallback(captureCallback);
  }, [cameraReady]);

  // Process pending camera capture
  useEffect(() => {
    const capture = async () => {
      if (!pendingCapture || !cameraRef.current) return;

      try {
        // Add delay if requested
        if (pendingCapture.params.delayMs) {
          await new Promise((r) => setTimeout(r, pendingCapture.params.delayMs));
        }

        const photo = await cameraRef.current.takePictureAsync({
          quality: pendingCapture.params.quality || 0.9,
          base64: true,
          exif: false,
        });

        if (photo?.base64) {
          pendingCapture.resolve({
            base64: photo.base64,
            width: photo.width,
            height: photo.height,
          });
          addLog(`Photo captured: ${photo.width}x${photo.height}`);
        } else {
          pendingCapture.reject(new Error('Failed to capture photo'));
        }
      } catch (error) {
        pendingCapture.reject(error instanceof Error ? error : new Error('Capture failed'));
        addLog(`Capture error: ${error}`);
      } finally {
        setPendingCapture(null);
      }
    };

    capture();
  }, [pendingCapture, addLog]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') {
        setCameraReady(true);
      } else {
        setCameraReady(false);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const handleConnect = () => {
    if (!host) {
      Alert.alert('Error', 'Please enter gateway host');
      return;
    }
    if (!token) {
      Alert.alert('Error', 'Please enter gateway token');
      return;
    }
    gateway.setGateway(host, parseInt(port, 10), token);
    gateway.connect();
    addLog(`Connecting to ${host}:${port}...`);
  };

  const handleDisconnect = () => {
    gateway.disconnect();
    addLog('Disconnected');
  };

  const requestPermissions = async () => {
    const camResult = await requestCameraPermission();
    if (camResult.granted) {
      addLog('Camera permission granted');
    }

    const locResult = await locationService.requestPermission(true);
    setLocationPermission(locResult);
    if (locResult) {
      addLog('Location permission granted');
    }
  };

  const testLocation = async () => {
    try {
      const result = await locationService.getLocation({ desiredAccuracy: 'balanced' });
      addLog(`Location: ${result.lat.toFixed(6)}, ${result.lon.toFixed(6)} (±${result.accuracyMeters}m)`);
    } catch (error) {
      addLog(`Location error: ${error}`);
    }
  };

  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return '#4CAF50';
      case 'connecting':
      case 'pairing':
        return '#FF9800';
      default:
        return '#F44336';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>⚡ Aria Node</Text>
          <Text style={styles.versionText}>v{APP_VERSION}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{connectionState}</Text>
      </View>

      {/* Camera Preview (hidden but active for captures) */}
      {cameraPermission?.granted && (
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={pendingCapture?.facing || 'front'}
            onCameraReady={() => setCameraReady(true)}
          />
        </View>
      )}

      {/* Connection Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gateway Connection</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.hostInput]}
            placeholder="Host (e.g., 192.168.1.100)"
            placeholderTextColor="#666"
            value={host}
            onChangeText={setHost}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={[styles.input, styles.portInput]}
            placeholder="Port"
            placeholderTextColor="#666"
            value={port}
            onChangeText={setPort}
            keyboardType="numeric"
          />
        </View>
        <TextInput
          style={[styles.input, { marginTop: 10 }]}
          placeholder="Gateway Token"
          placeholderTextColor="#666"
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
        <View style={styles.buttonRow}>
          {connectionState === 'disconnected' ? (
            <TouchableOpacity style={styles.button} onPress={handleConnect}>
              <Text style={styles.buttonText}>Connect</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, styles.disconnectButton]} onPress={handleDisconnect}>
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Permissions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permissions</Text>
        <View style={styles.permissionRow}>
          <Text style={styles.permissionLabel}>Camera:</Text>
          <Text style={[styles.permissionStatus, { color: cameraPermission?.granted ? '#4CAF50' : '#F44336' }]}>
            {cameraPermission?.granted ? 'Granted' : 'Denied'}
          </Text>
        </View>
        <View style={styles.permissionRow}>
          <Text style={styles.permissionLabel}>Location:</Text>
          <Text style={[styles.permissionStatus, { color: locationPermission ? '#4CAF50' : '#F44336' }]}>
            {locationPermission ? `Granted (${locationService.getMode()})` : 'Denied'}
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Request Permissions</Text>
        </TouchableOpacity>
      </View>

      {/* Test Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity style={styles.button} onPress={testLocation}>
          <Text style={styles.buttonText}>Test Location</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.resetButton, { marginTop: 10 }]} 
          onPress={async () => {
            await gateway.resetPairing();
            addLog('Pairing reset - new device ID generated');
            Alert.alert('Pairing Reset', 'Device ID regenerated. Try connecting again.');
          }}
        >
          <Text style={styles.buttonText}>Reset Pairing</Text>
        </TouchableOpacity>
      </View>

      {/* Logs */}
      <View style={styles.logsSection}>
        <Text style={styles.sectionTitle}>Logs</Text>
        <ScrollView style={styles.logsScroll}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>
              {log}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  versionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    color: '#888',
    fontSize: 14,
  },
  cameraContainer: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  camera: {
    width: 1,
    height: 1,
  },
  section: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    backgroundColor: '#2a2a4e',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  hostInput: {
    flex: 3,
  },
  portInput: {
    flex: 1,
  },
  buttonRow: {
    marginTop: 10,
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
  },
  resetButton: {
    backgroundColor: '#f59e0b',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  permissionLabel: {
    color: '#888',
    fontSize: 14,
  },
  permissionStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  logsSection: {
    flex: 1,
    padding: 15,
  },
  logsScroll: {
    flex: 1,
    backgroundColor: '#0d0d1a',
    borderRadius: 8,
    padding: 10,
  },
  logText: {
    color: '#4ade80',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});
