import {
  ChapterListModal,
  PlayerArtwork,
  PlayerChapterButton,
  PlayerEmptyState,
  PlayerPlaybackControls,
  PlayerProgress,
  PlayerSecondaryControls,
  PlayerTrackInfo,
  SleepTimerModal,
} from '@/components/player';
import { DarkColors, LightColors } from '@/constants/colors';
import { useAudiobook } from '@/context/AudiobookContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { useSleepTimer } from '@/hooks/useSleepTimer';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PlayerScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { skipForwardSeconds, skipBackwardSeconds } = useSettings();
  const {
    currentBook,
    playbackState,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    setPlaybackRate,
    playAudiobook,
    saveCurrentProgress,
  } = useAudiobook();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const [showChapters, setShowChapters] = useState(false);
  const [showTimerDialog, setShowTimerDialog] = useState(false);

  const handleTimerEnd = useCallback(async () => {
    await togglePlayPause();
  }, [togglePlayPause]);

  const { sleepTimer, setSleepTimer, cancelTimer } = useSleepTimer(handleTimerEnd);

  const handleSeekStart = useCallback(() => {
    setIsSeeking(true);
    setSeekPosition(playbackState.position);
  }, [playbackState.position]);

  const handleSeekChange = useCallback((value: number) => {
    setSeekPosition(value);
  }, []);

  const handleSeekComplete = useCallback(
    async (value: number) => {
      const position = Number(value);
      if (!Number.isFinite(position) || position < 0) return;
      await seekTo(position);
      setSeekPosition(position);
      setIsSeeking(false);
    },
    [seekTo]
  );

  const cyclePlaybackRate = useCallback(() => {
    const rates = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
    const currentIndex = rates.indexOf(playbackState.playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  }, [playbackState.playbackRate, setPlaybackRate]);

  const handleSelectChapter = useCallback(
    async (partIndex: number) => {
      if (!currentBook?.parts) return;
      const updatedBook = {
        ...currentBook,
        currentPart: partIndex,
        uri: currentBook.parts[partIndex].uri,
        currentPosition: 0,
      };
      await playAudiobook(updatedBook);
      setShowChapters(false);
    },
    [currentBook, playAudiobook]
  );

  const handleSetTimer = useCallback((minutes: number) => {
    setSleepTimer(minutes);
    setShowTimerDialog(false);
  }, [setSleepTimer]);

  const handleClose = useCallback(async () => {
    await saveCurrentProgress();
    router.back();
  }, [saveCurrentProgress, router]);

  if (!currentBook) {
    return (
      <View style={styles.container}>
        <PlayerEmptyState onGoToLibrary={() => router.back()} />
      </View>
    );
  }

  const currentPosition = isSeeking ? seekPosition : playbackState.position;
  const duration = Math.max(1, playbackState.duration || 1);
  const clampedPosition = Math.max(0, Math.min(currentPosition, duration));
  const hasMultipleParts = currentBook.parts && currentBook.parts.length > 1;
  const currentPartIndex = currentBook.currentPart ?? 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="chevron-back" size={32} color={colors.primaryOrange} />
      </TouchableOpacity>

      <PlayerArtwork artworkUri={currentBook.artwork} />
      <PlayerTrackInfo title={currentBook.title} author={currentBook.author} />

      {hasMultipleParts && (
        <PlayerChapterButton
          currentPartIndex={currentPartIndex}
          totalParts={currentBook.parts!.length}
          partLabel={t('player.part', {
            current: currentPartIndex + 1,
            total: currentBook.parts!.length,
          })}
          onPress={() => setShowChapters(true)}
        />
      )}

      <PlayerProgress
        position={clampedPosition}
        duration={duration}
        isSeeking={isSeeking}
        onSeekStart={handleSeekStart}
        onSeekChange={handleSeekChange}
        onSeekComplete={handleSeekComplete}
      />

      <PlayerPlaybackControls
        isPlaying={playbackState.isPlaying}
        onPlayPause={togglePlayPause}
        onSkipBackward={skipBackward}
        onSkipForward={skipForward}
        skipBackwardLabel={`${skipBackwardSeconds}s`}
        skipForwardLabel={`${skipForwardSeconds}s`}
      />

      <PlayerSecondaryControls
        playbackRate={playbackState.playbackRate}
        onCyclePlaybackRate={cyclePlaybackRate}
        sleepTimerMinutes={sleepTimer}
        onTimerPress={() => setShowTimerDialog(true)}
        onCancelTimer={cancelTimer}
      />

      <ChapterListModal
        visible={showChapters}
        title={t('player.selectPart')}
        parts={currentBook.parts ?? []}
        currentPartIndex={currentPartIndex}
        partNumberLabel={(number) => t('player.partNumber', { number })}
        onSelectPart={handleSelectChapter}
        onClose={() => setShowChapters(false)}
      />

      <SleepTimerModal
        visible={showTimerDialog}
        title={t('player.sleepTimer')}
        subtitle="Playback will pause after:"
        cancelLabel={t('common.cancel')}
        onSelectMinutes={handleSetTimer}
        onClose={() => setShowTimerDialog(false)}
      />
    </View>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    closeButton: {
      paddingTop: 36,
      paddingHorizontal: 16,
      alignSelf: 'flex-start',
    },
  });
