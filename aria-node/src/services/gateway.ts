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
const APP_VERSION = '0.2.2';

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
      publicKeyBytes.buffer
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
      keyPair.publicKey.buffer
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
      this.log('Using gatewayToken: ' + (this.gatewayToken ? 'SET (' + this.gatewayToken.substring(0, 8) + '...)' : 'NOT SET'));
      await this.sendConnect();
    } else if (event.event === 'node.invoke') {
      // Handle node invoke from gateway
      const params = event.payload as NodeInvokeParams;
      if (this.invokeHandler) {
        try {
          const result = await this.invokeHandler(params.command, params.params);
          // Send response back
          // Note: node.invoke uses events, not req/res - check protocol
        } catch (error) {
          this.log('Invoke handler error: ' + (error instanceof Error ? error.message : String(error)));
        }
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
        pending.reject(new Error(response.error?.message || 'Request failed'));
      }
    }
  }

  private async handleRequest(request: GatewayRequest): Promise<void> {
    // Gateway sending a request to us (node.invoke)
    if (request.method === 'node.invoke' && this.invokeHandler) {
      const params = request.params as NodeInvokeParams;
      try {
        const result = await this.invokeHandler(params.command, params.params);
        this.sendResponse(request.id, true, result);
      } catch (error) {
        this.sendResponse(request.id, false, undefined, {
          code: 'INVOKE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
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
        // Gateway token for server-level auth, device token for returning devices
        token: this.gatewayToken || this.deviceToken || undefined,
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
    const parts = [
      'v2',
      this.deviceId,
      'openclaw-ios',      // clientId
      'node',              // clientMode
      'node',              // role
      '',                  // scopes (empty for node)
      String(signedAt),
      this.gatewayToken || this.deviceToken || '',  // token
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
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
    }
    this.tickTimer = setInterval(() => {
      if (this.state === 'connected') {
        this.send('tick', {});
      }
    }, this.tickIntervalMs);
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
