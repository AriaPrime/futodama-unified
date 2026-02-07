// Gateway WebSocket Connection Service

import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';
import {
  GatewayMessage,
  GatewayRequest,
  GatewayResponse,
  GatewayEvent,
  ConnectParams,
  HelloOkPayload,
  NodeInvokeParams,
} from '../types/protocol';

const PROTOCOL_VERSION = 3;
const APP_VERSION = '0.4.0';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'pairing';
type MessageHandler = (message: GatewayMessage) => void;
type StateChangeHandler = (state: ConnectionState) => void;
type LogHandler = (message: string) => void;
type InvokeHandler = (command: string, params: Record<string, unknown>) => Promise<unknown>;

interface PendingRequest {
  resolve: (payload: unknown) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

// Global state that survives Metro hot-reload
// The module gets re-evaluated but `global` persists
interface GlobalGatewayState {
  ws: WebSocket | null;
  state: ConnectionState;
  connectedAt: number | null;
}

declare global {
  var __ariaGatewayState: GlobalGatewayState | undefined;
}

// Initialize global state if not present
if (!global.__ariaGatewayState) {
  global.__ariaGatewayState = {
    ws: null,
    state: 'disconnected',
    connectedAt: null,
  };
}

export class GatewayService {
  // Use global for WebSocket to survive hot-reload
  private get ws(): WebSocket | null {
    return global.__ariaGatewayState!.ws;
  }
  private set ws(value: WebSocket | null) {
    global.__ariaGatewayState!.ws = value;
  }
  
  // Use global for state to survive hot-reload
  private get state(): ConnectionState {
    return global.__ariaGatewayState!.state;
  }
  private set state(value: ConnectionState) {
    global.__ariaGatewayState!.state = value;
  }
  
  private host: string = '';
  private port: number = 18789;
  private gatewayToken: string = '';
  private deviceId: string = '';
  private publicKey: string = '';
  private secretKey: Uint8Array | null = null;
  private deviceToken: string | null = null;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private messageHandlers: Set<MessageHandler> = new Set();
  private stateChangeHandlers: Set<StateChangeHandler> = new Set();
  private logHandlers: Set<LogHandler> = new Set();
  private invokeHandler: InvokeHandler | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private tickIntervalMs: number = 15000;
  private challengeNonce: string = '';

  // Capabilities this node exposes
  private capabilities = ['camera', 'location', 'audio', 'microphone'];
  private commands = ['camera.snap', 'camera.list', 'location.get', 'audio.play', 'audio.stop', 'mic.record', 'mic.stop', 'screen.display', 'screen.clear'];
  private permissions: Record<string, boolean> = {
    'camera.capture': true,
    'location.get': true,
    'audio.play': true,
    'mic.record': true,
  };

  async initialize(): Promise<void> {
    // Generate or retrieve Ed25519 keypair
    // Use global cache to survive Metro hot-reloads (SecureStore can be flaky in Expo Go)
    let storedPublicKey: string | null = null;
    let storedSecretKey: string | null = null;
    
    // Check global cache first (survives hot-reload)
    if (global.__ariaGatewayState && (global.__ariaGatewayState as any).__publicKey) {
      storedPublicKey = (global.__ariaGatewayState as any).__publicKey;
      storedSecretKey = (global.__ariaGatewayState as any).__secretKey;
      this.log('Using cached keypair from global state');
    } else {
      // Try SecureStore
      try {
        storedPublicKey = await SecureStore.getItemAsync('publicKey');
        storedSecretKey = await SecureStore.getItemAsync('secretKey');
        if (storedPublicKey && storedSecretKey) {
          this.log('Loaded keypair from SecureStore');
          // Cache in global
          (global.__ariaGatewayState as any).__publicKey = storedPublicKey;
          (global.__ariaGatewayState as any).__secretKey = storedSecretKey;
        } else {
          this.log('SecureStore returned null for keypair');
        }
      } catch (error) {
        this.log('SecureStore error: ' + (error instanceof Error ? error.message : String(error)));
      }
    }

    if (!storedPublicKey || !storedSecretKey) {
      // Generate new Ed25519 keypair
      const keyPair = nacl.sign.keyPair();
      storedPublicKey = encodeBase64(keyPair.publicKey);
      storedSecretKey = encodeBase64(keyPair.secretKey);
      
      // Save to both global and SecureStore
      (global.__ariaGatewayState as any).__publicKey = storedPublicKey;
      (global.__ariaGatewayState as any).__secretKey = storedSecretKey;
      
      try {
        await SecureStore.setItemAsync('publicKey', storedPublicKey);
        await SecureStore.setItemAsync('secretKey', storedSecretKey);
        this.log('Generated and saved new Ed25519 keypair');
      } catch (error) {
        this.log('Failed to save to SecureStore: ' + (error instanceof Error ? error.message : String(error)));
        this.log('Keypair cached in memory only (will be lost on full app restart)');
      }
    }

    this.publicKey = storedPublicKey;
    this.secretKey = decodeBase64(storedSecretKey);

    // Device ID is derived from RAW public key bytes (SHA256 hex)
    // OpenClaw hashes the raw 32-byte public key, not the base64 string
    const publicKeyBytes = decodeBase64(storedPublicKey);
    const hashBuffer = await Crypto.digest(
      Crypto.CryptoDigestAlgorithm.SHA256,
      publicKeyBytes  // Pass Uint8Array directly, not .buffer
    );
    // Convert to hex string
    this.deviceId = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Cache device ID too
    (global.__ariaGatewayState as any).__deviceId = this.deviceId;

    // Retrieve stored device token if any
    try {
      this.deviceToken = await SecureStore.getItemAsync('deviceToken');
      if (this.deviceToken) {
        (global.__ariaGatewayState as any).__deviceToken = this.deviceToken;
      }
    } catch (error) {
      // Check global cache
      this.deviceToken = (global.__ariaGatewayState as any).__deviceToken || null;
    }

    // Retrieve stored gateway config
    try {
      const storedHost = await SecureStore.getItemAsync('gatewayHost');
      const storedPort = await SecureStore.getItemAsync('gatewayPort');
      const storedGatewayToken = await SecureStore.getItemAsync('gatewayToken');
      if (storedHost) this.host = storedHost;
      if (storedPort) this.port = parseInt(storedPort, 10);
      if (storedGatewayToken) this.gatewayToken = storedGatewayToken;
    } catch (error) {
      this.log('Failed to load gateway config from SecureStore');
    }

    this.log('Initialized with deviceId: ' + this.deviceId.substring(0, 16) + '...');
  }

  setGateway(host: string, port: number = 18789, token: string = ''): void {
    this.host = host;
    this.port = port;
    this.gatewayToken = token;
    SecureStore.setItemAsync('gatewayHost', host);
    SecureStore.setItemAsync('gatewayPort', port.toString());
    if (token) SecureStore.setItemAsync('gatewayToken', token);
    
    // Clear device token when setting new gateway - forces fresh pairing
    this.deviceToken = null;
    SecureStore.deleteItemAsync('deviceToken');
  }

  async resetPairing(): Promise<void> {
    // Clear all stored pairing data
    this.deviceToken = null;
    
    // Clear global cache
    if (global.__ariaGatewayState) {
      (global.__ariaGatewayState as any).__publicKey = null;
      (global.__ariaGatewayState as any).__secretKey = null;
      (global.__ariaGatewayState as any).__deviceId = null;
      (global.__ariaGatewayState as any).__deviceToken = null;
    }
    
    try {
      await SecureStore.deleteItemAsync('deviceToken');
      await SecureStore.deleteItemAsync('publicKey');
      await SecureStore.deleteItemAsync('secretKey');
    } catch (error) {
      this.log('Failed to clear SecureStore: ' + (error instanceof Error ? error.message : String(error)));
    }
    
    // Generate new Ed25519 keypair
    const keyPair = nacl.sign.keyPair();
    const newPublicKey = encodeBase64(keyPair.publicKey);
    const newSecretKey = encodeBase64(keyPair.secretKey);
    
    // Save to both global cache and SecureStore
    (global.__ariaGatewayState as any).__publicKey = newPublicKey;
    (global.__ariaGatewayState as any).__secretKey = newSecretKey;
    
    try {
      await SecureStore.setItemAsync('publicKey', newPublicKey);
      await SecureStore.setItemAsync('secretKey', newSecretKey);
    } catch (error) {
      this.log('Failed to save new keypair to SecureStore: ' + (error instanceof Error ? error.message : String(error)));
    }
    
    this.publicKey = newPublicKey;
    this.secretKey = keyPair.secretKey;
    
    // Device ID is derived from RAW public key bytes (SHA256 hex)
    const hashBuffer = await Crypto.digest(
      Crypto.CryptoDigestAlgorithm.SHA256,
      keyPair.publicKey  // Pass Uint8Array directly, not .buffer
    );
    this.deviceId = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Cache new device ID
    (global.__ariaGatewayState as any).__deviceId = this.deviceId;
    
    this.log('Pairing reset, new device ID: ' + this.deviceId.substring(0, 16) + '...');
  }

  getGatewayToken(): string {
    return this.gatewayToken;
  }

  getSettings(): { host: string; port: number; token: string } {
    return {
      host: this.host,
      port: this.port,
      token: this.gatewayToken,
    };
  }

  setInvokeHandler(handler: InvokeHandler): void {
    this.invokeHandler = handler;
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onStateChange(handler: StateChangeHandler): () => void {
    this.stateChangeHandlers.add(handler);
    return () => this.stateChangeHandlers.delete(handler);
  }

  onLog(handler: LogHandler): () => void {
    this.logHandlers.add(handler);
    return () => this.logHandlers.delete(handler);
  }

  private log(message: string): void {
    console.log(`[Gateway] ${message}`);
    this.logHandlers.forEach((handler) => handler(message));
  }

  getState(): ConnectionState {
    // Double-check: if WebSocket is open, state should be connected
    // (Belt + suspenders with the global state approach)
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      if (this.state === 'disconnected') {
        this.state = 'connected';
      }
    } else if (this.ws === null || this.ws.readyState === WebSocket.CLOSED) {
      if (this.state === 'connected') {
        this.state = 'disconnected';
      }
    }
    return this.state;
  }

  getDeviceId(): string {
    return this.deviceId;
  }

  connect(): void {
    if (this.state !== 'disconnected' || !this.host) {
      return;
    }

    this.setState('connecting');
    // Include gateway token in URL for server-level auth
    const url = this.gatewayToken 
      ? `ws://${this.host}:${this.port}?token=${encodeURIComponent(this.gatewayToken)}`
      : `ws://${this.host}:${this.port}`;
    
    this.log('Connecting to: ' + url.replace(/token=[^&]+/, 'token=***'));
    
    try {
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        this.log('WebSocket OPEN - connected!');
        this.log('Waiting for connect.challenge event...');
      };

      this.ws.onmessage = (event) => {
        this.log('Message received: ' + (typeof event.data === 'string' ? event.data.substring(0, 80) : typeof event.data));
        this.handleMessage(event.data);
      };

      this.ws.onerror = (error: any) => {
        this.log('WebSocket ERROR: ' + (error?.message || error?.type || 'unknown'));
      };

      this.ws.onclose = (event) => {
        this.log('WebSocket CLOSED - code: ' + event.code + ', reason: ' + (event.reason || 'none') + ', clean: ' + event.wasClean);
        this.handleDisconnect();
      };
    } catch (error) {
      this.log('Connection FAILED: ' + (error instanceof Error ? error.message : String(error)));
      this.handleDisconnect();
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setState('disconnected');
  }

  private setState(state: ConnectionState): void {
    this.state = state;
    this.stateChangeHandlers.forEach((handler) => handler(state));
  }

  private handleMessage(data: string): void {
    try {
      const message: GatewayMessage = JSON.parse(data);
      
      // Notify all handlers
      this.messageHandlers.forEach((handler) => handler(message));

      if (message.type === 'event') {
        this.handleEvent(message as GatewayEvent);
      } else if (message.type === 'res') {
        this.handleResponse(message as GatewayResponse);
      } else if (message.type === 'req') {
        this.handleRequest(message as GatewayRequest);
      }
    } catch (error) {
      this.log('Failed to parse message: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  private async handleEvent(event: GatewayEvent): Promise<void> {
    this.log('Received event: ' + event.event);
    if (event.event === 'connect.challenge') {
      // Received challenge, now send connect request
      this.challengeNonce = (event.payload as { nonce: string }).nonce;
      this.log('Got challenge nonce, sending connect...');
      this.log('Using deviceToken: ' + (this.deviceToken ? 'SET (' + this.deviceToken.substring(0, 8) + '...)' : 'NOT SET (new device)'));
      
      // Always try connect first - if device was approved via CLI, connect will succeed
      // even without a stored deviceToken. Only send pairing request if connect fails.
      try {
        await this.sendConnect();
        // If we get here, connect succeeded! We're paired.
        // handleHelloOk will be called via handleResponse
      } catch (error) {
        // Connect failed - check if we need to pair
        const errorMsg = error instanceof Error ? error.message : String(error);
        this.log('Connect failed: ' + errorMsg);
        
        // If not paired, send pairing request
        if (errorMsg.includes('NOT_PAIRED') || errorMsg.includes('pairing')) {
          this.log('Not paired - sending pairing request...');
          this.setState('pairing');
          await this.sendPairingRequest();
        }
      }
    } else if (event.event === 'node.pair.resolved') {
      // Pairing request was approved or rejected
      const payload = event.payload as { status: string; token?: string; nodeId?: string };
      if (payload.status === 'approved' && payload.token) {
        this.log('🎉 Pairing APPROVED! Got device token.');
        this.deviceToken = payload.token;
        // Cache in global state
        (global.__ariaGatewayState as any).__deviceToken = payload.token;
        // Try to persist to SecureStore
        try {
          await SecureStore.setItemAsync('deviceToken', payload.token);
        } catch (error) {
          this.log('Failed to persist deviceToken to SecureStore');
        }
        // Reconnect with the new token
        this.disconnect();
        setTimeout(() => this.connect(), 1000);
      } else {
        this.log('Pairing rejected or expired: ' + payload.status);
        this.setState('disconnected');
      }
    } else if (event.event === 'node.invoke.request') {
      // Handle node invoke from gateway
      // Gateway sends: { id, nodeId, command, paramsJSON, timeoutMs }
      // We must respond via node.invoke.result method
      const payload = event.payload as {
        id: string;
        nodeId: string;
        command: string;
        paramsJSON?: string | null;
        timeoutMs?: number;
      };
      
      this.log(`Invoke request: ${payload.command} (id=${payload.id.substring(0, 8)}...)`);
      
      if (this.invokeHandler) {
        const params = payload.paramsJSON ? JSON.parse(payload.paramsJSON) : {};
        try {
          const result = await this.invokeHandler(payload.command, params);
          // Send success result back via node.invoke.result
          await this.send('node.invoke.result', {
            id: payload.id,
            nodeId: this.deviceId,
            ok: true,
            payloadJSON: JSON.stringify(result),
          });
          this.log(`Invoke completed: ${payload.command}`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          this.log('Invoke handler error: ' + errorMsg);
          // Send error result back
          await this.send('node.invoke.result', {
            id: payload.id,
            nodeId: this.deviceId,
            ok: false,
            error: {
              code: 'INVOKE_ERROR',
              message: errorMsg,
            },
          });
        }
      } else {
        // No handler - send error
        await this.send('node.invoke.result', {
          id: payload.id,
          nodeId: this.deviceId,
          ok: false,
          error: {
            code: 'NO_HANDLER',
            message: 'No invoke handler registered',
          },
        });
      }
    }
  }

  private handleResponse(response: GatewayResponse): void {
    const pending = this.pendingRequests.get(response.id);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(response.id);
      
      if (response.ok) {
        // Check for hello-ok (connect response)
        const payload = response.payload as HelloOkPayload;
        if (payload?.type === 'hello-ok') {
          this.handleHelloOk(payload);
        }
        pending.resolve(response.payload);
      } else {
        // Check for NOT_PAIRED error - need to request pairing
        const errorCode = response.error?.code;
        if (errorCode === 'NOT_PAIRED' || errorCode?.startsWith('NOT_PAI')) {
          this.log('Not paired - requesting pairing approval...');
          this.requestPairing();
        }
        pending.reject(new Error(response.error?.message || 'Request failed'));
      }
    }
  }

  private async sendPairingRequest(): Promise<void> {
    try {
      // Build and sign a proper pairing request
      const signedAt = Date.now();
      const signature = this.signChallenge(this.challengeNonce, signedAt);
      
      const pairRequest = {
        nodeId: this.deviceId,
        publicKey: this.base64ToBase64Url(this.publicKey),
        signature,
        signedAt,
        name: `Ronni's iPhone`,
        platform: Platform.OS,
        capabilities: this.capabilities,
        commands: this.commands,
        permissions: this.permissions,
      };
      
      this.log('Sending node.pair.request with signature...');
      await this.send('node.pair.request', pairRequest);
      this.log('✅ Pairing request sent! Waiting for approval...');
      this.log('💡 On host, run: openclaw nodes pending');
    } catch (error) {
      this.log('Failed to send pairing request: ' + (error instanceof Error ? error.message : String(error)));
      // Will retry on next connect attempt
      this.setState('disconnected');
    }
  }

  private async requestPairing(): Promise<void> {
    this.setState('pairing');
    await this.sendPairingRequest();
  }

  private async handleRequest(request: GatewayRequest): Promise<void> {
    // Gateway uses EVENTS (node.invoke.request) for commands to nodes, not requests.
    // This handler is for any other request types the gateway might send.
    this.log(`Unhandled request method: ${request.method}`);
  }

  private handleHelloOk(payload: HelloOkPayload): void {
    this.log('Connected successfully! Protocol: ' + payload.protocol);
    
    if (payload.auth?.deviceToken) {
      this.deviceToken = payload.auth.deviceToken;
      // Cache in global state
      (global.__ariaGatewayState as any).__deviceToken = payload.auth.deviceToken;
      // Try to persist to SecureStore
      SecureStore.setItemAsync('deviceToken', payload.auth.deviceToken).catch(error => {
        this.log('Failed to persist deviceToken to SecureStore');
      });
    }
    
    this.tickIntervalMs = payload.policy.tickIntervalMs;
    this.setState('connected');
    this.startTicking();
  }

  private handleDisconnect(): void {
    this.ws = null;
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
    this.setState('disconnected');
    
    // Auto-reconnect after delay
    if (!this.reconnectTimer && this.host) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.connect();
      }, 5000);
    }
  }

  private async sendConnect(): Promise<void> {
    const signedAt = Date.now();
    const signature = this.signChallenge(this.challengeNonce, signedAt);
    
    const connectParams: ConnectParams = {
      minProtocol: PROTOCOL_VERSION,
      maxProtocol: PROTOCOL_VERSION,
      client: {
        id: 'openclaw-ios',
        version: APP_VERSION,
        platform: Platform.OS,
        mode: 'node',
      },
      role: 'node',
      scopes: [],
      caps: this.capabilities,
      commands: this.commands,
      permissions: this.permissions,
      auth: {
        // For initial pairing: use gatewayToken (operator auth from UI Token field)
        // For paired nodes: use deviceToken
        // Both must match what's in the signature payload!
        token: this.deviceToken || this.gatewayToken || undefined,
      },
      locale: 'en-US',
      userAgent: `aria-node/${APP_VERSION}`,
      device: {
        id: this.deviceId,
        publicKey: this.base64ToBase64Url(this.publicKey),
        signature,
        signedAt,
        nonce: this.challengeNonce,
      },
    };

    this.log('Sending connect request (publicKey: ' + this.publicKey.substring(0, 12) + '...)');
    await this.send('connect', connectParams);
  }

  private buildAuthPayload(nonce: string, signedAt: number): string {
    // OpenClaw v2 payload format:
    // v2|{deviceId}|{clientId}|{clientMode}|{role}|{scopes}|{signedAtMs}|{token}|{nonce}
    // IMPORTANT: token must match what we send in connect auth!
    // For initial pairing: use gatewayToken (operator auth)
    // For paired nodes: use deviceToken
    const authToken = this.deviceToken || this.gatewayToken || '';
    const parts = [
      'v2',
      this.deviceId,
      'openclaw-ios',      // clientId
      'node',              // clientMode
      'node',              // role
      '',                  // scopes (empty for node)
      String(signedAt),
      authToken,           // Must match connect auth.token
      nonce,
    ];
    return parts.join('|');
  }

  private signChallenge(nonce: string, signedAt: number): string {
    if (!this.secretKey) {
      throw new Error('Secret key not initialized');
    }
    
    // Build the payload in OpenClaw's expected format
    const payload = this.buildAuthPayload(nonce, signedAt);
    this.log('Signing payload: ' + payload.substring(0, 50) + '...');
    
    const messageBytes = new TextEncoder().encode(payload);
    const signatureBytes = nacl.sign.detached(messageBytes, this.secretKey);
    
    // Return as base64url (not regular base64)
    return this.base64ToBase64Url(encodeBase64(signatureBytes));
  }

  private base64ToBase64Url(base64: string): string {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private startTicking(): void {
    // NOTE: Nodes do NOT send tick requests.
    // The gateway broadcasts tick events TO nodes.
    // We just need to stay connected - the WebSocket itself is the keepalive.
    // tickIntervalMs from hello-ok is how often we'll RECEIVE ticks, not send them.
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
    this.log('Connected - listening for gateway tick events (no client-side tick needed)');
  }

  async send(method: string, params: Record<string, unknown>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('Not connected'));
        return;
      }

      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const request: GatewayRequest = {
        type: 'req',
        id,
        method,
        params,
      };

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error('Request timeout'));
      }, 30000);

      this.pendingRequests.set(id, { resolve, reject, timeout });
      this.ws.send(JSON.stringify(request));
    });
  }

  private sendResponse(
    id: string,
    ok: boolean,
    payload?: unknown,
    error?: { code: string; message: string }
  ): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const response: GatewayResponse = {
      type: 'res',
      id,
      ok,
      payload: payload as Record<string, unknown>,
      error,
    };

    this.ws.send(JSON.stringify(response));
  }
}

// Singleton instance
export const gateway = new GatewayService();
