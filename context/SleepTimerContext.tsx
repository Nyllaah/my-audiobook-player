import { TIMING } from '@/constants/timing';
import { useAudiobook } from '@/context/AudiobookContext';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

interface SleepTimerContextType {
  /** Remaining time in milliseconds, or null when no timer is set */
  sleepTimerRemainingMs: number | null;
  setSleepTimer: (minutes: number | null) => void;
  cancelTimer: () => void;
}

const SleepTimerContext = createContext<SleepTimerContextType | undefined>(undefined);

/**
 * Provider for sleep timer state so the timer persists across screen navigation.
 * Must be rendered inside AudiobookProvider (uses togglePlayPause when timer ends).
 */
export function SleepTimerProvider({ children }: { children: React.ReactNode }) {
  const { togglePlayPause } = useAudiobook();
  const [sleepTimerRemainingMs, setSleepTimerRemainingMs] =
    useState<number | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerEndTimeRef = useRef<number | null>(null);
  const onTimerEndRef = useRef(togglePlayPause);
  onTimerEndRef.current = togglePlayPause;

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

  const value: SleepTimerContextType = {
    sleepTimerRemainingMs,
    setSleepTimer,
    cancelTimer,
  };

  return (
    <SleepTimerContext.Provider value={value}>
      {children}
    </SleepTimerContext.Provider>
  );
}

export function useSleepTimer(): SleepTimerContextType {
  const context = useContext(SleepTimerContext);
  if (!context) {
    throw new Error('useSleepTimer must be used within SleepTimerProvider');
  }
  return context;
}
