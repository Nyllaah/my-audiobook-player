import { DarkColors, LightColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PlayerChapterButtonProps = {
  currentPartIndex: number;
  totalParts: number;
  partLabel: string;
  onPress: () => void;
};

export function PlayerChapterButton({
  currentPartIndex,
  totalParts,
  partLabel,
  onPress,
}: PlayerChapterButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Ionicons name="list" size={20} color={colors.primaryOrange} />
      <Text style={styles.label}>{partLabel}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.primaryOrange} />
    </TouchableOpacity>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundLight,
      marginHorizontal: 32,
      padding: 12,
      borderRadius: 8,
      gap: 8,
    },
    label: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '600',
    },
  });
