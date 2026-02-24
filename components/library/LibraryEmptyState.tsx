import { DarkColors, LightColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type LibraryEmptyStateProps = {
  emptyTitle: string;
  description: string;
  tipText: string;
};

export function LibraryEmptyState({
  emptyTitle,
  description,
  tipText,
}: LibraryEmptyStateProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.empty}>
      <Ionicons
        name="headset-outline"
        size={64}
        color={colors.textTertiary}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>{emptyTitle}</Text>
      <Text style={styles.subtitle}>{description}</Text>
      <View style={styles.tipContainer}>
        <Ionicons name="information-circle-outline" size={16} color={colors.primaryOrange} />
        <Text style={styles.tipText}>{tipText}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) =>
  StyleSheet.create({
    empty: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
      color: colors.textSecondary,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 24,
    },
    tipContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.backgroundLight,
      padding: 12,
      borderRadius: 8,
      marginHorizontal: 32,
      marginTop: 8,
      gap: 8,
    },
    tipText: {
      flex: 1,
      fontSize: 13,
      color: colors.text,
      lineHeight: 18,
    },
  });
