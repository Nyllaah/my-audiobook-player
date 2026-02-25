import { SeekBar } from '@/components/player/SeekBar';
import { DarkColors, LightColors } from '@/constants/colors';
import { useAudiobook } from '@/context/AudiobookContext';
import { useTheme } from '@/context/ThemeContext';
import { formatTime } from '@/utils/timeFormatter';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function PlayerProgress() {
  const { colors } = useTheme();
  const { playbackState, seekTo } = useAudiobook();
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  const duration = Math.max(1, playbackState.duration || 1);
  const position = isSeeking ? seekPosition : playbackState.position;
  const clampedPosition = Math.max(0, Math.min(position, duration));
  const styles = useMemo(() => createStyles(colors), [colors]);

  const onSeekStart = useCallback(() => {
    setIsSeeking(true);
    setSeekPosition(playbackState.position);
  }, [playbackState.position]);

  const onSeekChange = useCallback((value: number) => {
    setSeekPosition(value);
  }, []);

  const onSeekComplete = useCallback(
    async (value: number) => {
      const pos = Number(value);
      if (!Number.isFinite(pos) || pos < 0) return;
      await seekTo(pos);
      setSeekPosition(pos);
      setIsSeeking(false);
    },
    [seekTo]
  );

  return (
    <View style={styles.container}>
      <SeekBar
        position={clampedPosition}
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
        <Text style={styles.timeText}>{formatTime(clampedPosition)}</Text>
        <Text style={styles.timeText}>-{formatTime(duration - clampedPosition)}</Text>
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
