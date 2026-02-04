// OpenClaw Gateway Protocol Types

export interface ConnectParams {
  minProtocol: number;
  maxProtocol: number;
  client: {
    id: string;
    version: string;
    platform: string;
    mode: string;
  };
  role: 'node' | 'operator';
  scopes: string[];
  caps: string[];
  commands: string[];
  permissions: Record<string, boolean>;
  auth: {
    token?: string;
  };
  locale: string;
  userAgent: string;
  device: {
    id: string;
    publicKey: string;
    signature: string;
    signedAt: number;
    nonce: string;
  };
}

export interface GatewayRequest {
  type: 'req';
  id: string;
  method: string;
  params: Record<string, unknown>;
}

export interface GatewayResponse {
  type: 'res';
  id: string;
  ok: boolean;
  payload?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
  };
}

export interface GatewayEvent {
  type: 'event';
  event: string;
  payload: Record<string, unknown>;
  seq?: number;
  stateVersion?: number;
}

export type GatewayMessage = GatewayRequest | GatewayResponse | GatewayEvent;

export interface HelloOkPayload {
  type: 'hello-ok';
  protocol: number;
  policy: {
    tickIntervalMs: number;
  };
  auth?: {
    deviceToken: string;
    role: string;
    scopes: string[];
  };
}

export interface NodeInvokeParams {
  command: string;
  params: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface CameraSnapParams {
  facing?: 'front' | 'back';
  maxWidth?: number;
  quality?: number;
  format?: 'jpg';
  delayMs?: number;
  deviceId?: string;
}

export interface CameraSnapResult {
  format: 'jpg';
  base64: string;
  width: number;
  height: number;
}

export interface LocationGetParams {
  timeoutMs?: number;
  maxAgeMs?: number;
  desiredAccuracy?: 'coarse' | 'balanced' | 'precise';
}

export interface LocationGetResult {
  lat: number;
  lon: number;
  accuracyMeters: number;
  altitudeMeters?: number;
  speedMps?: number;
  headingDeg?: number;
  timestamp: string;
  isPrecise: boolean;
  source: 'gps' | 'wifi' | 'cell' | 'unknown';
}
