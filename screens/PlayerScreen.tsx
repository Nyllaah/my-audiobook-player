import { DarkColors, LightColors } from '@/constants/colors';
import { useAudiobook } from '@/context/AudiobookContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useSleepTimer } from '@/hooks/useSleepTimer';
import { formatTime } from '@/utils/timeFormatter';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const PLAYBACK_RATES = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0] as const;

export default function PlayerScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
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

  const handleSeekComplete = useCallback(async (value: number) => {
    await seekTo(value);
    setIsSeeking(false);
  }, [seekTo]);

  const cyclePlaybackRate = useCallback(() => {
    const currentIndex = PLAYBACK_RATES.indexOf(playbackState.playbackRate as typeof PLAYBACK_RATES[number]);
    const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
    setPlaybackRate(PLAYBACK_RATES[nextIndex]);
  }, [playbackState.playbackRate, setPlaybackRate]);

  const handleSelectChapter = useCallback(async (partIndex: number) => {
    if (!currentBook || !currentBook.parts) return;
    
    const updatedBook = {
      ...currentBook,
      currentPart: partIndex,
      uri: currentBook.parts[partIndex].uri,
      currentPosition: 0,
    };
    
    await playAudiobook(updatedBook);
    setShowChapters(false);
  }, [currentBook, playAudiobook]);

  const handleSetTimer = useCallback((minutes: number) => {
    setSleepTimer(minutes);
    setShowTimerDialog(false);
  }, [setSleepTimer]);

  const handleCancelTimer = useCallback(() => {
    cancelTimer();
  }, [cancelTimer]);

  if (!currentBook) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="musical-notes-outline" size={80} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Audiobook Playing</Text>
          <Text style={styles.emptySubtitle}>
            Select an audiobook from your library to start listening
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go to Library</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentPosition = isSeeking ? seekPosition : playbackState.position;
  const duration = playbackState.duration || 1;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={async () => {
          await saveCurrentProgress();
          router.back();
        }}
      >
        <Ionicons name="chevron-down" size={32} color={colors.primaryOrange} />
      </TouchableOpacity>

      <View style={styles.artworkContainer}>
        <View style={styles.artwork}>
          {currentBook.artwork ? (
            <Image 
              source={{ uri: currentBook.artwork }} 
              style={styles.artworkImage}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="book" size={120} color={colors.primaryOrange} />
          )}
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {currentBook.title}
        </Text>
        {currentBook.author && (
          <Text style={styles.author} numberOfLines={1}>
            {currentBook.author}
          </Text>
        )}
      </View>

      {/* Chapter/Part Selector */}
      {currentBook.parts && currentBook.parts.length > 1 && (
        <TouchableOpacity
          style={styles.chapterButton}
          onPress={() => setShowChapters(true)}
        >
          <Ionicons name="list" size={20} color={colors.primaryOrange} />
          <Text style={styles.chapterButtonText}>
            {t('player.part', { current: (currentBook.currentPart || 0) + 1, total: currentBook.parts.length })}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.primaryOrange} />
        </TouchableOpacity>
      )}

      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          value={currentPosition}
          minimumValue={0}
          maximumValue={duration}
          minimumTrackTintColor={colors.primaryOrange}
          maximumTrackTintColor={colors.textTertiary}
          thumbTintColor={colors.primaryOrange}
          onSlidingStart={handleSeekStart}
          onValueChange={handleSeekChange}
          onSlidingComplete={handleSeekComplete}
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
          <Text style={styles.timeText}>-{formatTime(duration - currentPosition)}</Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={skipBackward}
        >
          <Ionicons name="play-back" size={32} color={colors.primaryOrange} />
          <Text style={styles.skipText}>15s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playButton}
          onPress={togglePlayPause}
        >
          <Ionicons
            name={playbackState.isPlaying ? 'pause' : 'play'}
            size={32}
            color={colors.white}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={skipForward}
        >
          <Ionicons name="play-forward" size={32} color={colors.primaryOrange} />
          <Text style={styles.skipText}>30s</Text>
        </TouchableOpacity>
      </View>

      {/* Speed and Timer Controls */}
      <View style={styles.secondaryControls}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={cyclePlaybackRate}
        >
          <Ionicons name="speedometer-outline" size={20} color={colors.primaryOrange} />
          <Text style={styles.secondaryButtonText}>{playbackState.playbackRate}x</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => sleepTimer ? handleCancelTimer() : setShowTimerDialog(true)}
          onLongPress={sleepTimer ? handleCancelTimer : undefined}
        >
          <Ionicons name="timer-outline" size={20} color={sleepTimer ? colors.red : colors.primaryOrange} />
          <Text style={[styles.secondaryButtonText, sleepTimer ? styles.timerActive : null]}>
            {sleepTimer ? `${sleepTimer}m` : 'Timer'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chapter Selection Modal */}
      <Modal
        visible={showChapters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowChapters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.chapterModal}>
            <View style={styles.chapterHeader}>
              <Text style={styles.chapterModalTitle}>{t('player.selectPart')}</Text>
              <TouchableOpacity onPress={() => setShowChapters(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.chapterList}>
              {currentBook.parts?.map((part, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.chapterItem,
                    (currentBook.currentPart || 0) === index && styles.chapterItemActive,
                  ]}
                  onPress={() => handleSelectChapter(index)}
                >
                  <View style={styles.chapterInfo}>
                    <Text style={styles.chapterNumber}>{t('player.partNumber', { number: index + 1 })}</Text>
                    <Text style={styles.chapterName} numberOfLines={2}>
                      {part.filename}
                    </Text>
                  </View>
                  {(currentBook.currentPart || 0) === index && (
                    <Ionicons name="checkmark" size={24} color={colors.primaryOrange} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sleep Timer Dialog */}
      <Modal
        visible={showTimerDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimerDialog(false)}
      >
        <View style={styles.timerModalOverlay}>
          <View style={styles.timerDialog}>
            <Text style={styles.modalTitle}>Sleep Timer</Text>
            <Text style={styles.timerSubtitle}>Playback will pause after:</Text>
            
            <View style={styles.timerOptions}>
              {[5, 10, 15, 30, 45, 60].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={styles.timerOption}
                  onPress={() => handleSetTimer(minutes)}
                >
                  <Text style={styles.timerOptionText}>{minutes} min</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.timerCancelButton}
              onPress={() => setShowTimerDialog(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  closeButton: {
    paddingTop: 32,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  artworkContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  artwork: {
    width: 280,
    height: 280,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  author: {
    fontSize: 16,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 32,
    marginBottom:32,
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
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryOrange,
  },
  timerActive: {
    color: colors.primaryOrange,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: colors.primaryOrange,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  backButtonText: {
    color: colors.primaryOrange,
    fontSize: 16,
    fontWeight: '600',
  },
  chapterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundLight,
    marginHorizontal: 32,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  chapterButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  chapterModal: {
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chapterModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  chapterList: {
    maxHeight: 400,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chapterItemActive: {
    backgroundColor: colors.background,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterNumber: {
    fontSize: 12,
    color: colors.primaryOrange,
    fontWeight: '600',
    marginBottom: 4,
  },
  chapterName: {
    fontSize: 14,
    color: colors.text,
  },
  timerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerDialog: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
  },
  timerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  timerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  timerOption: {
    minWidth: '30%',
    backgroundColor: colors.background,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  timerOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryOrange,
  },
  timerCancelButton: {
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
