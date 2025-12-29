import { DarkColors, LightColors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Image,
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
  const { language, setLanguage, t } = useLanguage();
  const { defaultPlaybackSpeed, skipForwardSeconds, skipBackwardSeconds, setDefaultPlaybackSpeed, setSkipForwardSeconds, setSkipBackwardSeconds } = useSettings();
  
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const [speedModalVisible, setSpeedModalVisible] = useState(false);
  const [forwardModalVisible, setForwardModalVisible] = useState(false);
  const [backwardModalVisible, setBackwardModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  
  const playbackSpeeds = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
  const skipOptions = [10, 15, 30, 45, 60];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.playback')}</Text>
        
        {/* Playback Speed */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setSpeedModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="speedometer-outline" size={24} color={colors.primaryOrange} />
            <Text style={styles.settingTitle}>{t('settings.defaultSpeed')}</Text>
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
            <Ionicons name="play-forward" size={24} color={colors.primaryOrange} />
            <Text style={styles.settingTitle}>{t('settings.skipForward')}</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>{t('settings.seconds', { count: skipForwardSeconds })}</Text>
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
            <Ionicons name="play-back" size={24} color={colors.primaryOrange} />
            <Text style={styles.settingTitle}>{t('settings.skipBackward')}</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>{t('settings.seconds', { count: skipBackwardSeconds })}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon-outline" size={24} color={colors.primaryOrange} />
            <Text style={styles.settingTitle}>{t('settings.darkTheme')}</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.primaryVanilla, true: colors.primaryOrange }}
            thumbColor={colors.white}
          />
        </View>
        
        {/* Language */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setLanguageModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="language" size={24} color={colors.primaryOrange} />
            <Text style={styles.settingTitle}>{t('settings.language')}</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>{t(`languages.${language}`)}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        <View style={styles.aboutContainer}>
          <Image 
            source={require('@/assets/images/narria-logo.png')} 
            style={styles.logo} 
          />
          <Text style={styles.appName}>{t('settings.appName')}</Text>
          <Text style={styles.appVersion}>{t('settings.version')}</Text>
          <Text style={styles.appDescription}>
            {t('settings.description')}
          </Text>
          <Text style={styles.madeBy}>{t('settings.madeBy')}</Text>
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
            <Text style={styles.modalTitle}>{t('modals.playbackSpeed')}</Text>
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
            <Text style={styles.modalTitle}>{t('settings.skipForward')}</Text>
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
            <Text style={styles.modalTitle}>{t('settings.skipBackward')}</Text>
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
      
      {/* Language Modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLanguageModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('modals.selectLanguage')}</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  language === 'en' && styles.optionButtonActive,
                ]}
                onPress={() => {
                  setLanguage('en');
                  setLanguageModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    language === 'en' && styles.optionTextActive,
                  ]}
                >
                  {t('languages.en')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  language === 'pt-BR' && styles.optionButtonActive,
                ]}
                onPress={() => {
                  setLanguage('pt-BR');
                  setLanguageModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    language === 'pt-BR' && styles.optionTextActive,
                  ]}
                >
                  {t('languages.pt-BR')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 40,
    backgroundColor: colors.primaryBlue,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryVanilla,
  },
  section: {
    marginTop: 16,
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
    backgroundColor: colors.backgroundLight,
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
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 150,
    height: 44,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginTop: 8,
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
  madeBy: {
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.9,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
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
    minWidth: '30%',
    backgroundColor: colors.background,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    backgroundColor: colors.primaryOrange,
    borderColor: colors.primaryOrange,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  optionTextActive: {
    color: colors.white,
  },
});
