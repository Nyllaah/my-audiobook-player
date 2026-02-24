import { DarkColors, LightColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

type SettingsAboutCardProps = {
  appName: string;
  version: string;
  description: string;
  madeBy: string;
};

export function SettingsAboutCard({
  appName,
  version,
  description,
  madeBy,
}: SettingsAboutCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/narria-logo.png')}
        style={styles.logo}
      />
      <Text style={styles.appName}>{appName}</Text>
      <Text style={styles.appVersion}>{version}</Text>
      <Text style={styles.appDescription}>{description}</Text>
      <Text style={styles.madeBy}>{madeBy}</Text>
    </View>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) =>
  StyleSheet.create({
    container: {
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
  });
