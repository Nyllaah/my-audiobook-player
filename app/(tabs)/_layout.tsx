import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import MiniPlayer from '@/components/MiniPlayer';
import { useTheme } from '@/context/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();
  
  return (
    <>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: colors.backgroundLight,
            borderTopColor: colors.border,
            borderTopWidth: 1,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Library',
            headerShown: false,
            tabBarIcon: ({ color }) => <Ionicons name="library" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Settings',
            headerShown: false,
            tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />,
          }}
        />
      </Tabs>
      <MiniPlayer />
    </>
  );
}


