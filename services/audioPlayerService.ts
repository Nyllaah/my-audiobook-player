import { Audiobook } from '@/types/audiobook';
import { Platform } from 'react-native';
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State,
} from 'react-native-track-player';
import { storageService } from './storageService';

export enum PlayerState {
  None = 'none',
  Playing = 'playing',
  Paused = 'paused',
  Stopped = 'stopped',
  Buffering = 'buffering',
}

export type ProgressSaveCallback = (positionSeconds: number) => void;

const DEFAULT_SKIP_FORWARD = 30;
const DEFAULT_SKIP_BACKWARD = 15;

export class AudioPlayerService {
  private static instance: AudioPlayerService;
  private isInitialized = false;
  private currentAudiobook: Audiobook | null = null;
  private progressSaveCallback: ProgressSaveCallback | null = null;
  private eventSubscriptions: Array<{ remove: () => void }> = [];

  private constructor() {}

  static getInstance(): AudioPlayerService {
    if (!AudioPlayerService.instance) {
      AudioPlayerService.instance = new AudioPlayerService();
    }
    return AudioPlayerService.instance;
  }

  setProgressSaveCallback(callback: ProgressSaveCallback | null): void {
    this.progressSaveCallback = callback;
  }

  async savePositionNow(): Promise<void> {
    try {
      const progress = await TrackPlayer.getProgress();
      if (progress.position > 0) {
        this.progressSaveCallback?.(progress.position);
      }
    } catch {
      // ignore
    }
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      await TrackPlayer.setupPlayer({
        autoHandleInterruptions: true,
      });

      await this.applyNotificationOptions(DEFAULT_SKIP_FORWARD, DEFAULT_SKIP_BACKWARD);

      this.eventSubscriptions.forEach((sub) => sub.remove());
      this.eventSubscriptions = [];
      this.eventSubscriptions.push(
        TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
          this.savePositionNow();
        })
      );

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize player:', error);
    }
  }

  /** Call when user settings change (skip intervals). */
  async applyNotificationOptions(
    skipForwardSeconds: number = DEFAULT_SKIP_FORWARD,
    skipBackwardSeconds: number = DEFAULT_SKIP_BACKWARD
  ): Promise<void> {
    if (!this.isInitialized) return;
    try {
      await this.doUpdateNotificationOptions(skipForwardSeconds, skipBackwardSeconds);
    } catch (error) {
      console.error('Failed to update options:', error);
    }
  }

  /**
   * Re-applies notification options (including Android "stop when app killed").
   * Call from the playback service when it starts so the native layer has the correct behavior.
   */
  async applyNotificationOptionsFromStorage(): Promise<void> {
    try {
      const settings = await storageService.getSettings();
      await this.doUpdateNotificationOptions(
        settings.skipForwardSeconds,
        settings.skipBackwardSeconds
      );
    } catch (error) {
      console.error('Failed to apply notification options from storage:', error);
    }
  }

  private async doUpdateNotificationOptions(
    skipForwardSeconds: number = DEFAULT_SKIP_FORWARD,
    skipBackwardSeconds: number = DEFAULT_SKIP_BACKWARD
  ): Promise<void> {
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.SeekTo,
        Capability.JumpForward,
        Capability.JumpBackward,
      ],
      forwardJumpInterval: skipForwardSeconds,
      backwardJumpInterval: skipBackwardSeconds,
      progressUpdateEventInterval: 1,
      ...(Platform.OS === 'android' && {
        android: {
          appKilledPlaybackBehavior:
            AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
      }),
    });
  }

  audiobookToTrack(audiobook: Audiobook, uri: string, partIndex?: number): { url: string; title: string; artist: string; artwork?: string; duration?: number; id?: string } {
    return {
      id: partIndex !== undefined ? `${audiobook.id}-${partIndex}` : audiobook.id,
      url: uri,
      title: audiobook.title,
      artist: audiobook.author ?? '',
      artwork: audiobook.artwork,
      duration: audiobook.duration,
    };
  }

  async loadAudiobook(audiobook: Audiobook) {
    const load = async () => {
      await TrackPlayer.reset();
      this.currentAudiobook = audiobook;

      const startPosition = audiobook.currentPosition ?? 0;
      const partIndex = audiobook.currentPart ?? 0;

      if (audiobook.parts && audiobook.parts.length > 1) {
        const tracks = audiobook.parts.map((part, index) =>
          this.audiobookToTrack(audiobook, part.uri, index)
        );
        await TrackPlayer.setQueue(tracks);
        await TrackPlayer.skip(partIndex, startPosition);
      } else {
        const uri = audiobook.uri;
        const track = this.audiobookToTrack(audiobook, uri);
        await TrackPlayer.load(track);
        if (startPosition > 0) {
          await TrackPlayer.seekTo(startPosition);
        }
      }

      await TrackPlayer.updateNowPlayingMetadata({
        title: audiobook.title,
        artist: audiobook.author ?? '',
        artwork: audiobook.artwork,
      });
    };

    try {
      await load();
    } catch (error) {
      console.error('Failed to load audiobook (service may have been unbound):', error);
      // After notification is cleared, the native service can be unbound; re-setup and retry once
      try {
        this.isInitialized = false;
        await this.initialize();
        await load();
      } catch (retryError) {
        console.error('Failed to load audiobook after retry:', retryError);
        throw retryError;
      }
    }
  }

  async play() {
    try {
      await TrackPlayer.play();
    } catch (error) {
      console.error('Failed to play:', error);
    }
  }

  async pause() {
    try {
      await TrackPlayer.pause();
    } catch (error) {
      console.error('Failed to pause:', error);
    }
  }

  async seekTo(position: number) {
    try {
      await TrackPlayer.seekTo(position);
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  }

  async skipForward(seconds: number = DEFAULT_SKIP_FORWARD) {
    try {
      const progress = await TrackPlayer.getProgress();
      await TrackPlayer.seekTo(progress.position + seconds);
    } catch (error) {
      console.error('Failed to skip forward:', error);
    }
  }

  async skipBackward(seconds: number = DEFAULT_SKIP_BACKWARD) {
    try {
      const progress = await TrackPlayer.getProgress();
      await TrackPlayer.seekTo(Math.max(0, progress.position - seconds));
    } catch (error) {
      console.error('Failed to skip backward:', error);
    }
  }

  async setPlaybackRate(rate: number) {
    try {
      await TrackPlayer.setRate(rate);
    } catch (error) {
      console.error('Failed to set playback rate:', error);
    }
  }

  async getPosition(): Promise<number> {
    try {
      const progress = await TrackPlayer.getProgress();
      return progress.position;
    } catch {
      return 0;
    }
  }

  async getDuration(): Promise<number> {
    try {
      const progress = await TrackPlayer.getProgress();
      return progress.duration;
    } catch {
      return 0;
    }
  }

  async getState(): Promise<PlayerState> {
    try {
      const state = await TrackPlayer.getPlaybackState();
      switch (state.state) {
        case State.Playing:
          return PlayerState.Playing;
        case State.Paused:
        case State.Ready:
        case State.Stopped:
        case State.None:
        case State.Ended:
          return PlayerState.Paused;
        case State.Loading:
        case State.Buffering:
          return PlayerState.Buffering;
        case State.Error:
          return PlayerState.Stopped;
        default:
          return PlayerState.None;
      }
    } catch {
      return PlayerState.None;
    }
  }

  async getActivePartIndex(): Promise<number | undefined> {
    try {
      return await TrackPlayer.getActiveTrackIndex();
    } catch {
      return undefined;
    }
  }

  async stop() {
    try {
      const position = await this.getPosition();
      await TrackPlayer.reset();
      this.currentAudiobook = null;
      if (position > 0) {
        this.progressSaveCallback?.(position);
      }
    } catch (error) {
      console.error('Failed to stop:', error);
    }
  }

  getCurrentAudiobook(): Audiobook | null {
    return this.currentAudiobook;
  }

  /**
   * Updates the notification/now-playing metadata from an audiobook (title, artist, artwork).
   * Call after load + play so the notification shows our stored/edited cover instead of
   * embedded artwork from the audio file. Uses a short delay so the override runs after
   * the native layer has built the notification.
   */
  async updateNowPlayingMetadataFromAudiobook(audiobook: Audiobook): Promise<void> {
    if (!this.isInitialized) return;
    const artwork = audiobook.artwork;
    const title = audiobook.title;
    const artist = audiobook.author ?? '';
    const apply = async () => {
      try {
        const index = await TrackPlayer.getActiveTrackIndex();
        if (index != null && index !== undefined) {
          await TrackPlayer.updateMetadataForTrack(index, { artwork, title, artist });
        }
        await TrackPlayer.updateNowPlayingMetadata({ title, artist, artwork });
      } catch (e) {
        // ignore per-call errors
      }
    };
    try {
      await apply();
      setTimeout(() => apply(), 150);
      setTimeout(() => apply(), 400);
    } catch (error) {
      console.error('Failed to update now-playing metadata from audiobook:', error);
    }
  }

  /**
   * Updates the artwork for the currently active track (e.g. after user changes cover).
   * Use when the current audiobook's cover was updated so the notification reflects it.
   * Also calls updateNowPlayingMetadata so the notification refreshes immediately on Android
   * (updateMetadataForTrack alone often only updates after pause/state change).
   */
  async updateCurrentTrackArtwork(artwork: string | undefined): Promise<void> {
    if (!this.isInitialized) return;
    try {
      const index = await TrackPlayer.getActiveTrackIndex();
      if (index == null || index === undefined) return;
      await TrackPlayer.updateMetadataForTrack(index, { artwork });
      const track = await TrackPlayer.getActiveTrack();
      if (track) {
        await TrackPlayer.updateNowPlayingMetadata({
          title: track.title,
          artist: track.artist ?? '',
          artwork: artwork ?? track.artwork,
        });
      }
    } catch (error) {
      console.error('Failed to update track artwork:', error);
    }
  }

  /**
   * Syncs the notification/now-playing artwork from the stored audiobook list.
   * Call after app init or when returning to foreground so the notification shows
   * the latest cover (e.g. after user edited it) even if the track was loaded earlier.
   */
  async syncCurrentTrackArtworkFromAudiobooks(audiobooks: Audiobook[]): Promise<void> {
    if (!this.isInitialized || audiobooks.length === 0) return;
    try {
      const track = await TrackPlayer.getActiveTrack();
      if (!track?.id) return;
      const book = audiobooks.find(
        (b) => b.id === track.id || (typeof track.id === 'string' && track.id.startsWith(`${b.id}-`))
      );
      if (book) {
        const index = await TrackPlayer.getActiveTrackIndex();
        if (index != null && index !== undefined) {
          const artwork = book.artwork;
          await TrackPlayer.updateMetadataForTrack(index, { artwork });
          await TrackPlayer.updateNowPlayingMetadata({
            title: track.title,
            artist: track.artist ?? '',
            artwork: artwork ?? track.artwork,
          });
        }
      }
    } catch (error) {
      console.error('Failed to sync track artwork from audiobooks:', error);
    }
  }
}

export const audioPlayerService = AudioPlayerService.getInstance();
