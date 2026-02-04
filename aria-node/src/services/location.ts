// Location Service - Handles location queries for node commands

import * as Location from 'expo-location';
import { LocationGetParams, LocationGetResult } from '../types/protocol';

type LocationMode = 'off' | 'whileUsing' | 'always';

class LocationService {
  private hasPermission: boolean = false;
  private mode: LocationMode = 'off';

  async requestPermission(background: boolean = false): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    this.hasPermission = status === 'granted';
    
    if (this.hasPermission && background) {
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      this.mode = bgStatus === 'granted' ? 'always' : 'whileUsing';
    } else if (this.hasPermission) {
      this.mode = 'whileUsing';
    } else {
      this.mode = 'off';
    }
    
    return this.hasPermission;
  }

  async checkPermission(): Promise<boolean> {
    const { status } = await Location.getForegroundPermissionsAsync();
    this.hasPermission = status === 'granted';
    
    if (this.hasPermission) {
      const { status: bgStatus } = await Location.getBackgroundPermissionsAsync();
      this.mode = bgStatus === 'granted' ? 'always' : 'whileUsing';
    } else {
      this.mode = 'off';
    }
    
    return this.hasPermission;
  }

  getPermissionStatus(): boolean {
    return this.hasPermission;
  }

  getMode(): LocationMode {
    return this.mode;
  }

  async getLocation(params: LocationGetParams = {}): Promise<LocationGetResult> {
    if (!this.hasPermission) {
      throw new Error('LOCATION_PERMISSION_REQUIRED');
    }

    const accuracy = params.desiredAccuracy === 'precise' 
      ? Location.Accuracy.BestForNavigation
      : params.desiredAccuracy === 'coarse'
        ? Location.Accuracy.Low
        : Location.Accuracy.Balanced;

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy,
        timeInterval: params.maxAgeMs,
      });

      return {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
        accuracyMeters: location.coords.accuracy || 0,
        altitudeMeters: location.coords.altitude || undefined,
        speedMps: location.coords.speed || undefined,
        headingDeg: location.coords.heading || undefined,
        timestamp: new Date(location.timestamp).toISOString(),
        isPrecise: accuracy === Location.Accuracy.BestForNavigation,
        source: 'gps', // expo-location doesn't expose source
      };
    } catch (error) {
      if ((error as Error).message?.includes('timeout')) {
        throw new Error('LOCATION_TIMEOUT');
      }
      throw new Error('LOCATION_UNAVAILABLE');
    }
  }
}

export const locationService = new LocationService();
