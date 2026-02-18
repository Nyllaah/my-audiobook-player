import TrackPlayer, { Event } from 'react-native-track-player';
import { audioPlayerService } from './audioPlayerService';

/**
 * Playback service for react-native-track-player.
 * Handles remote events (notification, lock screen, Bluetooth) so they work when the app is in background.
 * Must be registered at app startup via TrackPlayer.registerPlaybackService().
 */
export async function playbackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    await audioPlayerService.savePositionNow();
    TrackPlayer.stop();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, (e) => {
    TrackPlayer.seekTo(e.position);
  });

  TrackPlayer.addEventListener(Event.RemoteJumpForward, async (e) => {
    const interval = e?.interval ?? 30;
    await TrackPlayer.seekBy(interval);
  });

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async (e) => {
    const interval = e?.interval ?? 15;
    await TrackPlayer.seekBy(-interval);
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
}
