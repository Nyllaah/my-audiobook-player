import { DarkColors, LightColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

type LibraryHeaderProps = {
  onAddPress: () => void;
};

export function LibraryHeader({ onAddPress }: LibraryHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.header}>
      <Image source={require('@/assets/images/narria-logo.png')} style={styles.logo} />
      <TouchableOpacity
        style={styles.headerButton}
        onPress={onAddPress}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={24} color={colors.primaryOrange} />
      </TouchableOpacity>
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
      paddingTop: 40,
      backgroundColor: colors.primaryBlue,
    },
    logo: {
      width: 110,
      height: 40,
      resizeMode: 'contain',
    },
    headerButton: {
      padding: 4,
    },
  });
