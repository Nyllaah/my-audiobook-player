/**
 * Timing constants used throughout the application
 */
export const TIMING = {
  PLAYBACK_STATE_UPDATE_INTERVAL: 500, // ms
  AUTO_SAVE_INTERVAL: 10000, // ms (10 seconds)
  SPLASH_SCREEN_HIDE_DELAY: 500, // ms
  SLEEP_TIMER_INTERVAL: 60000, // ms (1 minute) - used for display tick only
  SLEEP_TIMER_TICK_MS: 1000, // ms (1 second) - how often we check end time
  /** Max wait for TrackPlayer calls; prevents freeze when service is unbound after notification cleared */
  TRACK_PLAYER_CALL_TIMEOUT: 2000, // ms
} as const;

