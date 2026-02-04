// Command Handler - Routes node.invoke commands to services

import { cameraService } from './camera';
import { locationService } from './location';
import { CameraSnapParams, LocationGetParams } from '../types/protocol';

export type CameraCaptureCallback = (
  facing: 'front' | 'back',
  params: CameraSnapParams
) => Promise<{ base64: string; width: number; height: number }>;

class CommandHandler {
  private cameraCaptureCallback: CameraCaptureCallback | null = null;

  setCameraCaptureCallback(callback: CameraCaptureCallback): void {
    this.cameraCaptureCallback = callback;
  }

  async handle(command: string, params: Record<string, unknown>): Promise<unknown> {
    console.log('[Commands] Handling:', command, params);

    switch (command) {
      case 'camera.list':
        return this.handleCameraList();

      case 'camera.snap':
        return this.handleCameraSnap(params as CameraSnapParams);

      case 'location.get':
        return this.handleLocationGet(params as LocationGetParams);

      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  private async handleCameraList(): Promise<unknown> {
    const devices = await cameraService.listDevices();
    return { devices };
  }

  private async handleCameraSnap(params: CameraSnapParams): Promise<unknown> {
    if (!cameraService.getPermissionStatus()) {
      throw new Error('CAMERA_PERMISSION_REQUIRED');
    }

    if (!this.cameraCaptureCallback) {
      throw new Error('NODE_BACKGROUND_UNAVAILABLE');
    }

    const facing = params.facing || 'front';
    const result = await this.cameraCaptureCallback(facing, params);

    return {
      format: 'jpg',
      base64: result.base64,
      width: result.width,
      height: result.height,
    };
  }

  private async handleLocationGet(params: LocationGetParams): Promise<unknown> {
    return await locationService.getLocation(params);
  }
}

export const commandHandler = new CommandHandler();
