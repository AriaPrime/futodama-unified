// Camera Service - Handles camera capture for node commands

import { Camera, CameraType, CameraView } from 'expo-camera';
import { CameraSnapParams, CameraSnapResult } from '../types/protocol';

class CameraService {
  private hasPermission: boolean = false;

  async requestPermission(): Promise<boolean> {
    const { status } = await Camera.requestCameraPermissionsAsync();
    this.hasPermission = status === 'granted';
    return this.hasPermission;
  }

  async checkPermission(): Promise<boolean> {
    const { status } = await Camera.getCameraPermissionsAsync();
    this.hasPermission = status === 'granted';
    return this.hasPermission;
  }

  getPermissionStatus(): boolean {
    return this.hasPermission;
  }

  async listDevices(): Promise<{ id: string; name: string; position: string }[]> {
    // On mobile, we have front and back cameras
    return [
      { id: 'front', name: 'Front Camera', position: 'front' },
      { id: 'back', name: 'Back Camera', position: 'back' },
    ];
  }

  // Note: Actual capture requires a camera component to be mounted
  // This service provides the interface - the UI component handles capture
  async snap(params: CameraSnapParams): Promise<CameraSnapResult> {
    if (!this.hasPermission) {
      throw new Error('CAMERA_PERMISSION_REQUIRED');
    }
    
    // This will be called from the CameraCapture component
    throw new Error('Camera capture must be triggered from mounted CameraView');
  }
}

export const cameraService = new CameraService();
