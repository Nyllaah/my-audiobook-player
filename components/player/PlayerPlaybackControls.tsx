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
  playbackRate: number;
  onCyclePlaybackRate: () => void;
  sleepTimerRemainingMs: number | null;
  onTimerPress: () => void;
  onCancelTimer: () => void;
};

function formatTimerRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function PlayerPlaybackControls({
  isPlaying,
  onPlayPause,
  onSkipBackward,
  onSkipForward,
  skipBackwardLabel = '15s',
  skipForwardLabel = '30s',
  playbackRate,
  onCyclePlaybackRate,
  sleepTimerRemainingMs,
  onTimerPress,
  onCancelTimer,
}: PlayerPlaybackControlsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const hasTimer = sleepTimerRemainingMs !== null;

  const handleTimerPress = () => {
    if (hasTimer) {
      onCancelTimer();
    } else {
      onTimerPress();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onCyclePlaybackRate}>
        {playbackRate > 1 ? (
          <Text style={styles.buttonText}>{playbackRate}x</Text>
        ) : (
          <Ionicons name="speedometer-outline" size={20} color={colors.primaryOrange} />
        )}
      </TouchableOpacity>

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

      <TouchableOpacity
        style={styles.button}
        onPress={handleTimerPress}
        onLongPress={hasTimer ? onCancelTimer : undefined}
      >
        {hasTimer ? (
          <Text
          style={[
            styles.buttonText,
            hasTimer && styles.timerActive,
          ]}
        >
          {hasTimer ? formatTimerRemaining(sleepTimerRemainingMs!) : null}
        </Text>
        ) : (
          <Ionicons
            name="timer-outline"
            size={20}
            color={colors.primaryOrange}
          />
        )}
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
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 50,
      minHeight: 50,
      maxWidth: 50,
      maxHeight: 50,
      backgroundColor: colors.backgroundLight,
      borderRadius: 9999,
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
