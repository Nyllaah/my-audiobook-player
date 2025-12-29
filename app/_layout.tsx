import { TIMING } from '@/constants/timing';
import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { AudiobookProvider } from '@/context/AudiobookContext';
import { LanguageProvider } from '@/context/LanguageContext';
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
