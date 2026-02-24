import { TIMING } from '@/constants/timing';
import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import 'react-native-reanimated';
import TrackPlayer from 'react-native-track-player';

import { AudiobookProvider } from '@/context/AudiobookContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { playbackService } from '@/services/playbackService';

if (typeof (globalThis as unknown as { __TRACK_PLAYER_REGISTERED__?: boolean }).__TRACK_PLAYER_REGISTERED__ === 'undefined') {
  TrackPlayer.registerPlaybackService(() => playbackService);
  (globalThis as unknown as { __TRACK_PLAYER_REGISTERED__: boolean }).__TRACK_PLAYER_REGISTERED__ = true;
}

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };

    const timer = setTimeout(hideSplash, TIMING.SPLASH_SCREEN_HIDE_DELAY);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
      <ThemeProvider>
        <SettingsProvider>
          <AudiobookProvider onNotificationCleared={() => router.dismiss()}>
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
    </GestureHandlerRootView>
  );
}
