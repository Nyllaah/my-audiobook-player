import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SettingsScreen() {
  const { isDark, toggleTheme, colors } = useTheme();
  const { defaultPlaybackSpeed, skipForwardSeconds, skipBackwardSeconds, setDefaultPlaybackSpeed, setSkipForwardSeconds, setSkipBackwardSeconds } = useSettings();
  
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const [speedModalVisible, setSpeedModalVisible] = useState(false);
  const [forwardModalVisible, setForwardModalVisible] = useState(false);
  const [backwardModalVisible, setBackwardModalVisible] = useState(false);
  
  const playbackSpeeds = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
  const skipOptions = [10, 15, 30, 45, 60];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Playback</Text>
        
        {/* Playback Speed */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setSpeedModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="speedometer-outline" size={24} color={colors.primary} />
            <Text style={styles.settingTitle}>Default Playback Speed</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>{defaultPlaybackSpeed}x</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>
        
        {/* Skip Forward */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setForwardModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="play-forward" size={24} color={colors.primary} />
            <Text style={styles.settingTitle}>Skip Forward</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>{skipForwardSeconds} seconds</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>
        
        {/* Skip Backward */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setBackwardModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="play-back" size={24} color={colors.primary} />
            <Text style={styles.settingTitle}>Skip Backward</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>{skipBackwardSeconds} seconds</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon-outline" size={24} color={colors.primary} />
            <Text style={styles.settingTitle}>Dark Theme</Text>
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
      
      {/* Playback Speed Modal */}
      <Modal
        visible={speedModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSpeedModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSpeedModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Playback Speed</Text>
            <View style={styles.optionsContainer}>
              {playbackSpeeds.map((speed) => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.optionButton,
                    defaultPlaybackSpeed === speed && styles.optionButtonActive,
                  ]}
                  onPress={() => {
                    setDefaultPlaybackSpeed(speed);
                    setSpeedModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      defaultPlaybackSpeed === speed && styles.optionTextActive,
                    ]}
                  >
                    {speed}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Skip Forward Modal */}
      <Modal
        visible={forwardModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setForwardModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setForwardModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Skip Forward</Text>
            <View style={styles.optionsContainer}>
              {skipOptions.map((seconds) => (
                <TouchableOpacity
                  key={seconds}
                  style={[
                    styles.optionButton,
                    skipForwardSeconds === seconds && styles.optionButtonActive,
                  ]}
                  onPress={() => {
                    setSkipForwardSeconds(seconds);
                    setForwardModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      skipForwardSeconds === seconds && styles.optionTextActive,
                    ]}
                  >
                    {seconds}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Skip Backward Modal */}
      <Modal
        visible={backwardModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBackwardModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setBackwardModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Skip Backward</Text>
            <View style={styles.optionsContainer}>
              {skipOptions.map((seconds) => (
                <TouchableOpacity
                  key={seconds}
                  style={[
                    styles.optionButton,
                    skipBackwardSeconds === seconds && styles.optionButtonActive,
                  ]}
                  onPress={() => {
                    setSkipBackwardSeconds(seconds);
                    setBackwardModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      skipBackwardSeconds === seconds && styles.optionTextActive,
                    ]}
                  >
                    {seconds}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
    maxHeight: 56,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.background,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  optionTextActive: {
    color: '#FFF',
  },
});
