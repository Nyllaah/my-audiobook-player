import { SeekBar } from '@/components/player/SeekBar';
import { DarkColors, LightColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import { formatTime } from '@/utils/timeFormatter';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type PlayerProgressProps = {
  position: number;
  duration: number;
  isSeeking: boolean;
  onSeekStart: () => void;
  onSeekChange: (value: number) => void;
  onSeekComplete: (value: number) => void;
};

export function PlayerProgress({
  position,
  duration,
  isSeeking,
  onSeekStart,
  onSeekChange,
  onSeekComplete,
}: PlayerProgressProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <SeekBar
        position={position}
        duration={duration}
        isSeeking={isSeeking}
        minimumTrackTintColor={colors.primaryOrange}
        maximumTrackTintColor={colors.textTertiary}
        thumbTintColor={colors.primaryOrange}
        onSeekStart={onSeekStart}
        onSeekChange={onSeekChange}
        onSeekComplete={onSeekComplete}
        style={styles.slider}
      />
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>-{formatTime(duration - position)}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 32,
    },
    slider: {
      width: '100%',
      height: 40,
    },
    timeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    timeText: {
      fontSize: 14,
      color: colors.textTertiary,
    },
  });
