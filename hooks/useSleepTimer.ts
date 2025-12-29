import { TIMING } from '@/constants/timing';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSleepTimerReturn {
  sleepTimer: number | null;
  setSleepTimer: (minutes: number | null) => void;
  cancelTimer: () => void;
}

/**
 * Custom hook for managing sleep timer functionality
 */
export function useSleepTimer(
  onTimerEnd: () => void | Promise<void>
): UseSleepTimerReturn {
  const [sleepTimer, setSleepTimerState] = useState<number | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cancelTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setSleepTimerState(null);
  }, []);

  useEffect(() => {
    if (sleepTimer !== null && sleepTimer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setSleepTimerState((prev) => {
          if (prev === null || prev <= 1) {
            onTimerEnd();
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            return null;
          }
          return prev - 1;
        });
      }, TIMING.SLEEP_TIMER_INTERVAL);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };
    }
  }, [sleepTimer, onTimerEnd]);

  const setSleepTimer = useCallback((minutes: number | null) => {
    setSleepTimerState(minutes);
  }, []);

  return {
    sleepTimer,
    setSleepTimer,
    cancelTimer,
  };
}

