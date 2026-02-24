import { DarkColors, LightColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type SettingsHeaderProps = {
  title: string;
};

export function SettingsHeader({ title }: SettingsHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop: 40,
      backgroundColor: colors.primaryBlue,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primaryVanilla,
    },
  });
