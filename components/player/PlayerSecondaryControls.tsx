import { DarkColors, LightColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PLAYBACK_RATES = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0] as const;

type PlayerSecondaryControlsProps = {
  playbackRate: number;
  onCyclePlaybackRate: () => void;
  /** Remaining time in ms; null when no sleep timer is set */
  sleepTimerRemainingMs: number | null;
  onTimerPress: () => void;
  onCancelTimer: () => void;
  onNotePress: () => void;
  notesCount: number;
};

function formatTimerRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function PlayerSecondaryControls({
  playbackRate,
  onCyclePlaybackRate,
  sleepTimerRemainingMs,
  onTimerPress,
  onCancelTimer,
  onNotePress,
  notesCount,
}: PlayerSecondaryControlsProps) {
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
      <TouchableOpacity style={styles.button} onPress={onNotePress}>
        <Ionicons name="create-outline" size={20} color={colors.primaryOrange} />
        <Text style={styles.buttonText}>
          {`(${notesCount})`}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onCyclePlaybackRate}>
        <Ionicons name="speedometer-outline" size={20} color={colors.primaryOrange} />
        <Text style={styles.buttonText}>{playbackRate}x</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleTimerPress}
        onLongPress={hasTimer ? onCancelTimer : undefined}
      >
        <Ionicons
          name="timer-outline"
          size={20}
          color={hasTimer ? colors.red : colors.primaryOrange}
        />
        <Text
          style={[
            styles.buttonText,
            hasTimer && styles.timerActive,
          ]}
        >
          {hasTimer ? formatTimerRemaining(sleepTimerRemainingMs!) : 'Timer'}
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
      minWidth: 100,
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
