import { DarkColors, LightColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PlayerEmptyStateProps = {
  onGoToLibrary: () => void;
};

export function PlayerEmptyState({ onGoToLibrary }: PlayerEmptyStateProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Ionicons name="musical-notes-outline" size={80} color={colors.textTertiary} />
      <Text style={styles.title}>No Audiobook Playing</Text>
      <Text style={styles.subtitle}>
        Select an audiobook from your library to start listening
      </Text>
      <TouchableOpacity style={styles.button} onPress={onGoToLibrary}>
        <Text style={styles.buttonText}>Go to Library</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textTertiary,
      textAlign: 'center',
      marginBottom: 24,
    },
    button: {
      backgroundColor: colors.primaryOrange,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 12,
    },
    buttonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '600',
    },
  });
