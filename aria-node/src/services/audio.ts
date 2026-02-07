// Audio Playback Service for Voice Output

import { Audio } from 'expo-av';

export interface PlayAudioParams {
  url?: string;           // URL to audio file
  base64?: string;        // Base64 encoded audio data
  format?: string;        // Audio format (mp3, wav, etc.) - default mp3
  volume?: number;        // 0.0 to 1.0 - default 1.0
}

export interface PlayAudioResult {
  played: boolean;
  durationMs?: number;
  error?: string;
}

export type AudioState = 'idle' | 'playing' | 'paused';
export type AudioStateCallback = (state: AudioState) => void;

class AudioService {
  private currentSound: Audio.Sound | null = null;
  private isInitialized = false;
  private _state: AudioState = 'idle';
  private stateCallbacks: AudioStateCallback[] = [];

  get state(): AudioState { return this._state; }

  onStateChange(cb: AudioStateCallback): void {
    this.stateCallbacks.push(cb);
  }

  private setState(state: AudioState): void {
    this._state = state;
    for (const cb of this.stateCallbacks) cb(state);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Configure audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,  // Play even when phone is on silent
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      this.isInitialized = true;
      console.log('[Audio] Service initialized');
    } catch (error) {
      console.error('[Audio] Failed to initialize:', error);
      throw error;
    }
  }

  async play(params: PlayAudioParams): Promise<PlayAudioResult> {
    await this.initialize();
    
    // Stop any currently playing audio
    await this.stop();

    try {
      let source: { uri: string } | number;
      
      if (params.url) {
        // Play from URL
        source = { uri: params.url };
        console.log('[Audio] Playing from URL:', params.url.substring(0, 50) + '...');
      } else if (params.base64) {
        // Play from base64 data
        const format = params.format || 'mp3';
        const dataUri = `data:audio/${format};base64,${params.base64}`;
        source = { uri: dataUri };
        console.log('[Audio] Playing from base64 data, format:', format);
      } else {
        return { played: false, error: 'No audio source provided (url or base64 required)' };
      }

      // Create and load the sound
      const { sound, status } = await Audio.Sound.createAsync(
        source,
        { 
          shouldPlay: true, 
          volume: params.volume ?? 1.0,
        }
      );

      this.currentSound = sound;
      this.setState('playing');

      // Wait for playback to finish
      return new Promise((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            const durationMs = status.durationMillis || 0;
            console.log('[Audio] Playback finished, duration:', durationMs, 'ms');
            this.setState('idle');
            this.cleanup();
            resolve({ played: true, durationMs });
          }
          if (!status.isLoaded && 'error' in status) {
            console.error('[Audio] Playback error:', status.error);
            this.setState('idle');
            this.cleanup();
            resolve({ played: false, error: status.error });
          }
        });
      });

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[Audio] Play failed:', errorMsg);
      return { played: false, error: errorMsg };
    }
  }

  async pause(): Promise<void> {
    if (this.currentSound && this._state === 'playing') {
      try {
        await this.currentSound.pauseAsync();
        this.setState('paused');
        console.log('[Audio] Paused');
      } catch (error) {
        console.error('[Audio] Pause failed:', error);
      }
    }
  }

  async resume(): Promise<void> {
    if (this.currentSound && this._state === 'paused') {
      try {
        await this.currentSound.playAsync();
        this.setState('playing');
        console.log('[Audio] Resumed');
      } catch (error) {
        console.error('[Audio] Resume failed:', error);
      }
    }
  }

  async togglePlayPause(): Promise<void> {
    if (this._state === 'playing') {
      await this.pause();
    } else if (this._state === 'paused') {
      await this.resume();
    }
  }

  async stop(): Promise<void> {
    if (this.currentSound) {
      try {
        await this.currentSound.stopAsync();
        this.setState('idle');
        await this.cleanup();
      } catch (error) {
        // Ignore errors when stopping
      }
    }
  }

  private async cleanup(): Promise<void> {
    if (this.currentSound) {
      try {
        await this.currentSound.unloadAsync();
      } catch (error) {
        // Ignore cleanup errors
      }
      this.currentSound = null;
    }
  }

  // Check if currently playing
  async isPlaying(): Promise<boolean> {
    if (!this.currentSound) return false;
    try {
      const status = await this.currentSound.getStatusAsync();
      return status.isLoaded && status.isPlaying;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const audioService = new AudioService();
