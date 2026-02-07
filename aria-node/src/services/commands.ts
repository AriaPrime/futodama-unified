// Command Handler - Routes node.invoke commands to services

import { cameraService } from './camera';
import { locationService } from './location';
import { audioService, PlayAudioParams } from './audio';
import { micService, RecordParams } from './mic';
import { CameraSnapParams, LocationGetParams } from '../types/protocol';

export type CameraCaptureCallback = (
  facing: 'front' | 'back',
  params: CameraSnapParams
) => Promise<{ base64: string; width: number; height: number }>;

export interface ScreenDisplayParams {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  duration?: string;
  isPlaying?: boolean;
}

export type ScreenDisplayCallback = (data: ScreenDisplayParams | null) => void;

class CommandHandler {
  private cameraCaptureCallback: CameraCaptureCallback | null = null;
  private screenDisplayCallback: ScreenDisplayCallback | null = null;

  setCameraCaptureCallback(callback: CameraCaptureCallback): void {
    this.cameraCaptureCallback = callback;
  }

  setScreenDisplayCallback(callback: ScreenDisplayCallback): void {
    this.screenDisplayCallback = callback;
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

      case 'audio.play':
        return this.handleAudioPlay(params as PlayAudioParams);

      case 'audio.stop':
        return this.handleAudioStop();

      case 'mic.record':
        return this.handleMicRecord(params as RecordParams);

      case 'mic.stop':
        return this.handleMicStop();

      case 'screen.display':
        return this.handleScreenDisplay(params as ScreenDisplayParams);

      case 'screen.clear':
        return this.handleScreenClear();

      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  private async handleAudioPlay(params: PlayAudioParams): Promise<unknown> {
    // If screen display callback is set, also update now playing
    if (this.screenDisplayCallback && (params as any).title) {
      this.screenDisplayCallback({
        title: (params as any).title,
        subtitle: (params as any).subtitle || (params as any).channel,
        imageUrl: (params as any).imageUrl || (params as any).thumbnailUrl,
        isPlaying: true,
      });
    }
    const result = await audioService.play(params);
    return result;
  }

  private async handleAudioStop(): Promise<unknown> {
    await audioService.stop();
    // Clear now playing
    if (this.screenDisplayCallback) {
      this.screenDisplayCallback(null);
    }
    return { stopped: true };
  }

  private async handleMicRecord(params: RecordParams): Promise<unknown> {
    const result = await micService.record(params);
    return result;
  }

  private async handleMicStop(): Promise<unknown> {
    const result = await micService.stop();
    return result || { stopped: true };
  }

  private async handleScreenDisplay(params: ScreenDisplayParams): Promise<unknown> {
    if (this.screenDisplayCallback) {
      this.screenDisplayCallback(params);
    }
    return { displayed: true };
  }

  private async handleScreenClear(): Promise<unknown> {
    if (this.screenDisplayCallback) {
      this.screenDisplayCallback(null);
    }
    return { cleared: true };
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
