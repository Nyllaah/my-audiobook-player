import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsScreen() {
  const { isDark, toggleTheme, colors } = useTheme();
  
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const settingsItems = [
    {
      icon: 'speedometer-outline' as const,
      title: 'Default Playback Speed',
      value: '1.0x',
    },
    {
      icon: 'time-outline' as const,
      title: 'Skip Forward',
      value: '30 seconds',
    },
    {
      icon: 'time-outline' as const,
      title: 'Skip Backward',
      value: '15 seconds',
    },
    {
      icon: 'moon-outline' as const,
      title: 'Theme',
      value: 'Auto',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Playback</Text>
        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.settingItem}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Ionicons name={item.icon} size={24} color="#007AFF" />
              <Text style={styles.settingTitle}>{item.title}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{item.value}</Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon-outline" size={24} color={colors.primary} />
            <Text style={[styles.settingTitle, { color: colors.text }]}>Dark Theme</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#E5E5EA', true: colors.primary }}
            thumbColor="#FFF"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutContainer}>
          <Ionicons name="book" size={60} color="#007AFF" />
          <Text style={styles.appName}>Audiobook Player</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            A beautiful and intuitive audiobook player for your favorite stories.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundCard,
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: colors.text,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 16,
    color: colors.textTertiary,
  },
  aboutContainer: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
  },
  appVersion: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 4,
  },
  appDescription: {
    fontSize: 16,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
});
