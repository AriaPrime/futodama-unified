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
const APP_VERSION = '0.2.5';

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

export class GatewayService {
  private ws: WebSocket | null = null;
  private host: string = '';
  private port: number = 18789;
  private gatewayToken: string = '';
  private state: ConnectionState = 'disconnected';
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
  private capabilities = ['camera', 'location'];
  private commands = ['camera.snap', 'camera.list', 'location.get'];
  private permissions: Record<string, boolean> = {
    'camera.capture': true,
    'location.get': true,
  };

  async initialize(): Promise<void> {
    // Generate or retrieve Ed25519 keypair
    let storedPublicKey = await SecureStore.getItemAsync('publicKey');
    let storedSecretKey = await SecureStore.getItemAsync('secretKey');

    if (!storedPublicKey || !storedSecretKey) {
      // Generate new Ed25519 keypair
      const keyPair = nacl.sign.keyPair();
      storedPublicKey = encodeBase64(keyPair.publicKey);
      storedSecretKey = encodeBase64(keyPair.secretKey);
      await SecureStore.setItemAsync('publicKey', storedPublicKey);
      await SecureStore.setItemAsync('secretKey', storedSecretKey);
      this.log('Generated new Ed25519 keypair');
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

    // Retrieve stored device token if any
    this.deviceToken = await SecureStore.getItemAsync('deviceToken');

    // Retrieve stored gateway config
    const storedHost = await SecureStore.getItemAsync('gatewayHost');
    const storedPort = await SecureStore.getItemAsync('gatewayPort');
    const storedGatewayToken = await SecureStore.getItemAsync('gatewayToken');
    if (storedHost) this.host = storedHost;
    if (storedPort) this.port = parseInt(storedPort, 10);
    if (storedGatewayToken) this.gatewayToken = storedGatewayToken;

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
    await SecureStore.deleteItemAsync('deviceToken');
    await SecureStore.deleteItemAsync('publicKey');
    await SecureStore.deleteItemAsync('secretKey');
    
    // Generate new Ed25519 keypair
    const keyPair = nacl.sign.keyPair();
    const newPublicKey = encodeBase64(keyPair.publicKey);
    const newSecretKey = encodeBase64(keyPair.secretKey);
    await SecureStore.setItemAsync('publicKey', newPublicKey);
    await SecureStore.setItemAsync('secretKey', newSecretKey);
    
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
      
      // Gateway requires `connect` as first request
      // If we don't have a device token, we need to pair - send both connect and pair request
      // in rapid succession before gateway closes connection
      if (!this.deviceToken) {
        this.log('New device - sending connect + pairing request together...');
        this.setState('pairing');
        // Send connect first (required), then immediately send pairing request
        // Don't await connect - send both quickly
        this.sendConnect().catch(() => {}); // Ignore connect error, we expect NOT_PAIRED
        // Small delay to ensure connect is sent first
        await new Promise(resolve => setTimeout(resolve, 50));
        await this.sendPairingRequest();
      } else {
        await this.sendConnect();
      }
    } else if (event.event === 'node.pair.resolved') {
      // Pairing request was approved or rejected
      const payload = event.payload as { status: string; token?: string; nodeId?: string };
      if (payload.status === 'approved' && payload.token) {
        this.log('🎉 Pairing APPROVED! Got device token.');
        this.deviceToken = payload.token;
        await SecureStore.setItemAsync('deviceToken', payload.token);
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
      SecureStore.setItemAsync('deviceToken', payload.auth.deviceToken);
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
