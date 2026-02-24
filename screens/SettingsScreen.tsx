import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import {
  OptionPickerModal,
  SettingsAboutCard,
  SettingsHeader,
  SettingsSection,
  SettingRow,
} from '@/components/settings';
import type { OptionItem } from '@/components/settings';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function SettingsScreen() {
  const { isDark, toggleTheme, colors } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const {
    defaultPlaybackSpeed,
    skipForwardSeconds,
    skipBackwardSeconds,
    setDefaultPlaybackSpeed,
    setSkipForwardSeconds,
    setSkipBackwardSeconds,
  } = useSettings();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const [speedModalVisible, setSpeedModalVisible] = useState(false);
  const [forwardModalVisible, setForwardModalVisible] = useState(false);
  const [backwardModalVisible, setBackwardModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const playbackSpeeds: OptionItem<number>[] = [
    0.75, 1.0, 1.25, 1.5, 1.75, 2.0,
  ].map((s) => ({ value: s, label: `${s}x` }));

  const skipOptions: OptionItem<number>[] = [10, 15, 30, 45, 60].map((s) => ({
    value: s,
    label: t('settings.seconds', { count: s }),
  }));

  const languageOptions: OptionItem<'en' | 'pt-BR'>[] = [
    { value: 'en', label: t('languages.en') },
    { value: 'pt-BR', label: t('languages.pt-BR') },
  ];

  return (
    <ScrollView style={styles.container}>
      <SettingsHeader title={t('settings.title')} />

      <SettingsSection title={t('settings.playback')}>
        <SettingRow
          icon="speedometer-outline"
          title={t('settings.defaultSpeed')}
          value={`${defaultPlaybackSpeed}x`}
          onPress={() => setSpeedModalVisible(true)}
        />
        <SettingRow
          icon="play-forward"
          title={t('settings.skipForward')}
          value={t('settings.seconds', { count: skipForwardSeconds })}
          onPress={() => setForwardModalVisible(true)}
        />
        <SettingRow
          icon="play-back"
          title={t('settings.skipBackward')}
          value={t('settings.seconds', { count: skipBackwardSeconds })}
          onPress={() => setBackwardModalVisible(true)}
        />
      </SettingsSection>

      <SettingsSection title={t('settings.appearance')}>
        <SettingRow
          icon="moon-outline"
          title={t('settings.darkTheme')}
          switchValue={isDark}
          onSwitchChange={toggleTheme}
        />
        <SettingRow
          icon="language"
          title={t('settings.language')}
          value={t(`languages.${language}`)}
          onPress={() => setLanguageModalVisible(true)}
        />
      </SettingsSection>

      <SettingsSection title={t('settings.about')}>
        <SettingsAboutCard
          appName={t('settings.appName')}
          version={t('settings.version')}
          description={t('settings.description')}
          madeBy={t('settings.madeBy')}
        />
      </SettingsSection>

      <OptionPickerModal
        visible={speedModalVisible}
        title={t('modals.playbackSpeed')}
        options={playbackSpeeds}
        selectedValue={defaultPlaybackSpeed}
        onSelect={setDefaultPlaybackSpeed}
        onClose={() => setSpeedModalVisible(false)}
      />

      <OptionPickerModal
        visible={forwardModalVisible}
        title={t('settings.skipForward')}
        options={skipOptions}
        selectedValue={skipForwardSeconds}
        onSelect={setSkipForwardSeconds}
        onClose={() => setForwardModalVisible(false)}
      />

      <OptionPickerModal
        visible={backwardModalVisible}
        title={t('settings.skipBackward')}
        options={skipOptions}
        selectedValue={skipBackwardSeconds}
        onSelect={setSkipBackwardSeconds}
        onClose={() => setBackwardModalVisible(false)}
      />

      <OptionPickerModal
        visible={languageModalVisible}
        title={t('modals.selectLanguage')}
        options={languageOptions}
        selectedValue={language}
        onSelect={setLanguage}
        onClose={() => setLanguageModalVisible(false)}
      />
    </ScrollView>
  );
}

const createStyles = (colors: { background: string }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });
