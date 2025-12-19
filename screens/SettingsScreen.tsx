import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#000',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 16,
    color: '#8E8E93',
  },
  aboutContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
  },
  appVersion: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  appDescription: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
});
