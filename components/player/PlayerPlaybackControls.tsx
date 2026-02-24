import { DarkColors, LightColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PlayerPlaybackControlsProps = {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
  skipBackwardLabel?: string;
  skipForwardLabel?: string;
};

export function PlayerPlaybackControls({
  isPlaying,
  onPlayPause,
  onSkipBackward,
  onSkipForward,
  skipBackwardLabel = '15s',
  skipForwardLabel = '30s',
}: PlayerPlaybackControlsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.controlButton} onPress={onSkipBackward}>
        <Ionicons name="play-back" size={32} color={colors.primaryOrange} />
        <Text style={styles.skipText}>{skipBackwardLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.playButton} onPress={onPlayPause}>
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={32}
          color={colors.white}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.controlButton} onPress={onSkipForward}>
        <Ionicons name="play-forward" size={32} color={colors.primaryOrange} />
        <Text style={styles.skipText}>{skipForwardLabel}</Text>
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
      paddingHorizontal: 16,
      gap: 32,
    },
    controlButton: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    skipText: {
      fontSize: 12,
      color: colors.textTertiary,
    },
    playButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primaryOrange,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primaryOrange,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 8,
    },
  });
