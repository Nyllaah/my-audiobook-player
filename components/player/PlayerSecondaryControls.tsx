import { DarkColors, LightColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PlayerSecondaryControlsProps = {
  onNotePress: () => void;
  notesCount: number;
  onBookmarkPress: () => void;
  bookmarksCount: number;
};

export function PlayerSecondaryControls({
  onNotePress,
  notesCount,
  onBookmarkPress,
  bookmarksCount,
}: PlayerSecondaryControlsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onNotePress}>
        <Ionicons name="create-outline" size={20} color={colors.primaryOrange} />
        <Text style={styles.buttonText}>
          {`(${notesCount})`}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onBookmarkPress}>
        <Ionicons name="bookmark-outline" size={20} color={colors.primaryOrange} />
        <Text style={styles.buttonText}>
          {bookmarksCount > 0 ? `(${bookmarksCount})` : ''}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.backgroundLight,
      borderRadius: 20,
      minWidth: 75,
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primaryOrange,
    },
    timerActive: {
      color: colors.primaryOrange,
    },
  });
