import { DarkColors, LightColors } from '@/constants/colors';
import { useAudiobook } from '@/context/AudiobookContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function PlayerPlaybackControls() {
  const { colors } = useTheme();
  const { skipForwardSeconds, skipBackwardSeconds } = useSettings();
  const { playbackState, togglePlayPause, skipForward, skipBackward } =
    useAudiobook();

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
        <TouchableOpacity style={styles.controlButton} onPress={skipBackward}>
          <Ionicons name="play-back" size={32} color={colors.primaryOrange} />
          <Text style={styles.skipText}>{skipBackwardSeconds}s</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
          <Ionicons
            name={playbackState.isPlaying ? 'pause' : 'play'}
            size={32}
            color={colors.white}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={skipForward}>
          <Ionicons name="play-forward" size={32} color={colors.primaryOrange} />
          <Text style={styles.skipText}>{skipForwardSeconds}s</Text>
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
      gap: 24,
      marginTop: -16
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
