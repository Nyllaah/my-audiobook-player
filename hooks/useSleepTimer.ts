import { TIMING } from '@/constants/timing';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSleepTimerReturn {
  /** Remaining time in milliseconds, or null when no timer is set */
  sleepTimerRemainingMs: number | null;
  setSleepTimer: (minutes: number | null) => void;
  cancelTimer: () => void;
}

/**
 * Custom hook for managing sleep timer functionality.
 * Ticks every second and stops playback when the end time is reached.
 */
export function useSleepTimer(
  onTimerEnd: () => void | Promise<void>
): UseSleepTimerReturn {
  const [sleepTimerRemainingMs, setSleepTimerRemainingMs] =
    useState<number | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerEndTimeRef = useRef<number | null>(null);
  const onTimerEndRef = useRef(onTimerEnd);
  onTimerEndRef.current = onTimerEnd;

  const cancelTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    timerEndTimeRef.current = null;
    setSleepTimerRemainingMs(null);
  }, []);

  const isActive = sleepTimerRemainingMs !== null && sleepTimerRemainingMs > 0;

  useEffect(() => {
    if (!isActive) {
      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    const tickMs = TIMING.SLEEP_TIMER_TICK_MS;

    timerIntervalRef.current = setInterval(() => {
      const endTime = timerEndTimeRef.current;
      if (endTime == null) return;

      const remainingMs = endTime - Date.now();

      if (remainingMs <= 0) {
        timerEndTimeRef.current = null;
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        setSleepTimerRemainingMs(null);
        void onTimerEndRef.current();
        return;
      }

      setSleepTimerRemainingMs(remainingMs);
    }, tickMs);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isActive]);

  const setSleepTimer = useCallback(
    (minutes: number | null) => {
      if (minutes === null || minutes <= 0) {
        cancelTimer();
        return;
      }

      const endTime = Date.now() + minutes * 60_000;
      timerEndTimeRef.current = endTime;
      setSleepTimerRemainingMs(minutes * 60_000);
    },
    [cancelTimer]
  );

  return {
    sleepTimerRemainingMs,
    setSleepTimer,
    cancelTimer,
  };
}

