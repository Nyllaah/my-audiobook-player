import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import MiniPlayer from '@/components/player/mini-player';
import { HapticTab } from '@/components/ui/haptic-tab';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  
  return (
    <>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          tabBarActiveTintColor: colors.primaryOrange,
          tabBarInactiveTintColor: colors.textTertiary,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: colors.primaryBlue,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: t('library.title'),
            headerShown: false,
            tabBarIcon: ({ color }) => <Ionicons name="library" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: t('settings.title'),
            headerShown: false,
            tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />,
          }}
        />
      </Tabs>
      <MiniPlayer />
    </>
  );
}


