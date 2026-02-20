import { TIMING } from '@/constants/timing';
import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox, Platform } from 'react-native';

LogBox.ignoreLogs([
  'The app is running using the Legacy Architecture',
  'Unable to activate keep awake', // Known Expo/Android issue when device locked or app backgrounded
]);
import TrackPlayer from 'react-native-track-player';
import 'react-native-reanimated';

import { AudiobookProvider } from '@/context/AudiobookContext';
import { playbackService } from '@/services/playbackService';
import { LanguageProvider } from '@/context/LanguageContext';

if (typeof __TRACK_PLAYER_REGISTERED__ === 'undefined') {
  TrackPlayer.registerPlaybackService(() => playbackService);
  (globalThis as unknown as { __TRACK_PLAYER_REGISTERED__?: boolean }).__TRACK_PLAYER_REGISTERED__ = true;
}
import { SettingsProvider } from '@/context/SettingsContext';
import { ThemeProvider } from '@/context/ThemeContext';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };

    const timer = setTimeout(hideSplash, TIMING.SPLASH_SCREEN_HIDE_DELAY);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LanguageProvider>
      <ThemeProvider>
        <SettingsProvider>
          <AudiobookProvider>
            <NavigationThemeProvider value={DefaultTheme}>
              <Stack initialRouteName="(tabs)">
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen 
                  name="player" 
                  options={{ 
                    presentation: Platform.OS === 'android' ? 'transparentModal' : 'modal',
                    headerShown: false,
                  }} 
                />
              </Stack>
              <StatusBar style="auto" />
            </NavigationThemeProvider>
          </AudiobookProvider>
        </SettingsProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
