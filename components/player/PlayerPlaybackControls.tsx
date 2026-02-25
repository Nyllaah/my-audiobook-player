import { DarkColors, LightColors } from '@/constants/colors';
import { useAudiobook } from '@/context/AudiobookContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { useSleepTimer } from '@/hooks/useSleepTimer';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SleepTimerModal } from './SleepTimerModal';

function formatTimerRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const PLAYBACK_RATES = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0] as const;

export function PlayerPlaybackControls() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { skipForwardSeconds, skipBackwardSeconds } = useSettings();
  const {
    playbackState,
    togglePlayPause,
    skipForward,
    skipBackward,
    setPlaybackRate,
  } = useAudiobook();

  const handleTimerEnd = useCallback(async () => {
    await togglePlayPause();
  }, [togglePlayPause]);

  const { sleepTimerRemainingMs, setSleepTimer, cancelTimer } =
    useSleepTimer(handleTimerEnd);

  const [showTimerDialog, setShowTimerDialog] = useState(false);
  const hasTimer = sleepTimerRemainingMs !== null;

  const cyclePlaybackRate = useCallback(() => {
    const currentIndex = PLAYBACK_RATES.indexOf(
      playbackState.playbackRate as (typeof PLAYBACK_RATES)[number]
    );
    const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
    setPlaybackRate(PLAYBACK_RATES[nextIndex]);
  }, [playbackState.playbackRate, setPlaybackRate]);

  const handleTimerPress = () => {
    if (hasTimer) {
      cancelTimer();
    } else {
      setShowTimerDialog(true);
    }
  };

  const handleSetTimer = useCallback((minutes: number) => {
    setSleepTimer(minutes);
    setShowTimerDialog(false);
  }, [setSleepTimer]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={cyclePlaybackRate}>
          {playbackState.playbackRate > 1 ? (
            <Text style={styles.buttonText}>{playbackState.playbackRate}x</Text>
          ) : (
            <Ionicons name="speedometer-outline" size={20} color={colors.primaryOrange} />
          )}
        </TouchableOpacity>

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

        <TouchableOpacity
          style={styles.button}
          onPress={handleTimerPress}
          onLongPress={hasTimer ? cancelTimer : undefined}
        >
          {hasTimer ? (
            <Text
              style={[styles.buttonText, hasTimer && styles.timerActive]}
            >
              {formatTimerRemaining(sleepTimerRemainingMs!)}
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

      <SleepTimerModal
        visible={showTimerDialog}
        title={t('player.sleepTimer')}
        subtitle="Playback will pause after:"
        cancelLabel={t('common.cancel')}
        onSelectMinutes={handleSetTimer}
        onClose={() => setShowTimerDialog(false)}
      />
    </>
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
