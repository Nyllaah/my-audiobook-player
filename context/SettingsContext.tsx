import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface SettingsContextType {
  defaultPlaybackSpeed: number;
  skipForwardSeconds: number;
  skipBackwardSeconds: number;
  setDefaultPlaybackSpeed: (speed: number) => Promise<void>;
  setSkipForwardSeconds: (seconds: number) => Promise<void>;
  setSkipBackwardSeconds: (seconds: number) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_KEY = '@audiobook_settings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [defaultPlaybackSpeed, setDefaultPlaybackSpeedState] = useState(1.0);
  const [skipForwardSeconds, setSkipForwardSecondsState] = useState(30);
  const [skipBackwardSeconds, setSkipBackwardSecondsState] = useState(15);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        setDefaultPlaybackSpeedState(settings.defaultPlaybackSpeed || 1.0);
        setSkipForwardSecondsState(settings.skipForwardSeconds || 30);
        setSkipBackwardSecondsState(settings.skipBackwardSeconds || 15);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings: Partial<SettingsContextType>) => {
    try {
      const settings = {
        defaultPlaybackSpeed,
        skipForwardSeconds,
        skipBackwardSeconds,
        ...newSettings,
      };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const setDefaultPlaybackSpeed = async (speed: number) => {
    setDefaultPlaybackSpeedState(speed);
    await saveSettings({ defaultPlaybackSpeed: speed });
  };

  const setSkipForwardSeconds = async (seconds: number) => {
    setSkipForwardSecondsState(seconds);
    await saveSettings({ skipForwardSeconds: seconds });
  };

  const setSkipBackwardSeconds = async (seconds: number) => {
    setSkipBackwardSecondsState(seconds);
    await saveSettings({ skipBackwardSeconds: seconds });
  };

  return (
    <SettingsContext.Provider
      value={{
        defaultPlaybackSpeed,
        skipForwardSeconds,
        skipBackwardSeconds,
        setDefaultPlaybackSpeed,
        setSkipForwardSeconds,
        setSkipBackwardSeconds,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
