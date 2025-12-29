import { Audiobook } from '@/types/audiobook';
import { Audio, AVPlaybackStatus } from 'expo-av';

export enum PlayerState {
  None = 'none',
  Playing = 'playing',
  Paused = 'paused',
  Stopped = 'stopped',
  Buffering = 'buffering',
}

export class AudioPlayerService {
  private static instance: AudioPlayerService;
  private sound: Audio.Sound | null = null;
  private isInitialized = false;
  private currentStatus: AVPlaybackStatus | null = null;
  private currentAudiobook: Audiobook | null = null;

  private constructor() {}

  static getInstance(): AudioPlayerService {
    if (!AudioPlayerService.instance) {
      AudioPlayerService.instance = new AudioPlayerService();
    }
    return AudioPlayerService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        allowsRecordingIOS: false,
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize player:', error);
    }
  }

  async loadAudiobook(audiobook: Audiobook) {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      this.currentAudiobook = audiobook;
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: audiobook.uri },
        { 
          shouldPlay: false, 
          positionMillis: (audiobook.currentPosition || 0) * 1000,
          isLooping: false,
          progressUpdateIntervalMillis: 1000,
        },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.sound = sound;
      this.currentStatus = status;
    } catch (error) {
      console.error('Failed to load audiobook:', error);
      throw error;
    }
  }


  private onPlaybackStatusUpdate(status: AVPlaybackStatus) {
    this.currentStatus = status;
  }

  async play() {
    try {
      if (this.sound) {
        await this.sound.playAsync();
      }
    } catch (error) {
      console.error('Failed to play:', error);
    }
  }

  async pause() {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
      }
    } catch (error) {
      console.error('Failed to pause:', error);
    }
  }

  async seekTo(position: number) {
    try {
      if (this.sound) {
        await this.sound.setPositionAsync(position * 1000);
      }
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  }

  async skipForward(seconds: number = 30) {
    try {
      const position = await this.getPosition();
      await this.seekTo(position + seconds);
    } catch (error) {
      console.error('Failed to skip forward:', error);
    }
  }

  async skipBackward(seconds: number = 15) {
    try {
      const position = await this.getPosition();
      await this.seekTo(Math.max(0, position - seconds));
    } catch (error) {
      console.error('Failed to skip backward:', error);
    }
  }

  async setPlaybackRate(rate: number) {
    try {
      if (this.sound) {
        await this.sound.setRateAsync(rate, true);
      }
    } catch (error) {
      console.error('Failed to set playback rate:', error);
    }
  }

  async getPosition(): Promise<number> {
    try {
      if (this.sound && this.currentStatus && this.currentStatus.isLoaded) {
        return this.currentStatus.positionMillis / 1000;
      }
      return 0;
    } catch (error) {
      console.error('Failed to get position:', error);
      return 0;
    }
  }

  async getDuration(): Promise<number> {
    try {
      if (this.sound && this.currentStatus && this.currentStatus.isLoaded) {
        return (this.currentStatus.durationMillis || 0) / 1000;
      }
      return 0;
    } catch (error) {
      console.error('Failed to get duration:', error);
      return 0;
    }
  }

  async getState(): Promise<PlayerState> {
    try {
      if (!this.sound || !this.currentStatus) {
        return PlayerState.None;
      }
      if (!this.currentStatus.isLoaded) {
        return PlayerState.None;
      }
      if (this.currentStatus.isBuffering) {
        return PlayerState.Buffering;
      }
      if (this.currentStatus.isPlaying) {
        return PlayerState.Playing;
      }
      return PlayerState.Paused;
    } catch (error) {
      console.error('Failed to get state:', error);
      return PlayerState.None;
    }
  }

  async stop() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (error) {
      console.error('Failed to stop:', error);
    }
  }

  getSound(): Audio.Sound | null {
    return this.sound;
  }
}

export const audioPlayerService = AudioPlayerService.getInstance();
