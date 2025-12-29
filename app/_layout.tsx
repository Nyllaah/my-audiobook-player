import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { AudiobookProvider } from '@/context/AudiobookContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { ThemeProvider } from '@/context/ThemeContext';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
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
                    animationEnabled: Platform.OS !== 'android',
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
