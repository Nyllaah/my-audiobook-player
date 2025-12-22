import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAudiobook } from '@/context/AudiobookContext';

export default function PlayerScreen() {
  const router = useRouter();
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

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const [showChapters, setShowChapters] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [showTimerDialog, setShowTimerDialog] = useState(false);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const playbackRates = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
    setSeekPosition(playbackState.position);
  };

  const handleSeekChange = (value: number) => {
    setSeekPosition(value);
  };

  const handleSeekComplete = async (value: number) => {
    await seekTo(value);
    setIsSeeking(false);
  };

  const cyclePlaybackRate = () => {
    const currentIndex = playbackRates.indexOf(playbackState.playbackRate);
    const nextIndex = (currentIndex + 1) % playbackRates.length;
    setPlaybackRate(playbackRates[nextIndex]);
  };

  const handleSelectChapter = async (partIndex: number) => {
    if (!currentBook || !currentBook.parts) return;
    
    const updatedBook = {
      ...currentBook,
      currentPart: partIndex,
      uri: currentBook.parts[partIndex].uri,
      currentPosition: 0,
    };
    
    await playAudiobook(updatedBook);
    setShowChapters(false);
  };

  const handleSetTimer = (minutes: number) => {
    setSleepTimer(minutes);
    setShowTimerDialog(false);
  };

  const handleCancelTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setSleepTimer(null);
  };

  // Sleep timer countdown
  useEffect(() => {
    if (sleepTimer !== null && sleepTimer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setSleepTimer((prev) => {
          if (prev === null || prev <= 1) {
            // Timer finished - pause playback
            togglePlayPause();
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            return null;
          }
          return prev - 1;
        });
      }, 60000); // Decrease every minute

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };
    }
  }, [sleepTimer, togglePlayPause]);

  if (!currentBook) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="musical-notes-outline" size={80} color="#C7C7CC" />
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
        <Ionicons name="chevron-down" size={32} color="#007AFF" />
      </TouchableOpacity>

      <View style={styles.artworkContainer}>
        <View style={styles.artwork}>
          <Ionicons name="book" size={120} color="#007AFF" />
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
          <Ionicons name="list" size={20} color="#007AFF" />
          <Text style={styles.chapterButtonText}>
            Part {(currentBook.currentPart || 0) + 1} of {currentBook.parts.length}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#007AFF" />
        </TouchableOpacity>
      )}

      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          value={currentPosition}
          minimumValue={0}
          maximumValue={duration}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#C7C7CC"
          thumbTintColor="#007AFF"
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
          <Ionicons name="play-back" size={32} color="#007AFF" />
          <Text style={styles.skipText}>15s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playButton}
          onPress={togglePlayPause}
        >
          <Ionicons
            name={playbackState.isPlaying ? 'pause' : 'play'}
            size={40}
            color="#FFF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={skipForward}
        >
          <Ionicons name="play-forward" size={32} color="#007AFF" />
          <Text style={styles.skipText}>30s</Text>
        </TouchableOpacity>
      </View>

      {/* Speed and Timer Controls */}
      <View style={styles.secondaryControls}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={cyclePlaybackRate}
        >
          <Ionicons name="speedometer-outline" size={20} color="#007AFF" />
          <Text style={styles.secondaryButtonText}>{playbackState.playbackRate}x</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => sleepTimer ? handleCancelTimer() : setShowTimerDialog(true)}
          onLongPress={sleepTimer ? handleCancelTimer : undefined}
        >
          <Ionicons name="timer-outline" size={20} color={sleepTimer ? '#FF3B30' : '#007AFF'} />
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
              <Text style={styles.chapterModalTitle}>Select Part</Text>
              <TouchableOpacity onPress={() => setShowChapters(false)}>
                <Ionicons name="close" size={28} color="#000" />
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
                    <Text style={styles.chapterNumber}>Part {index + 1}</Text>
                    <Text style={styles.chapterName} numberOfLines={2}>
                      {part.filename}
                    </Text>
                  </View>
                  {(currentBook.currentPart || 0) === index && (
                    <Ionicons name="checkmark" size={24} color="#007AFF" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  closeButton: {
    padding: 16,
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
    backgroundColor: '#E5F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  infoContainer: {
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  author: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 32,
    marginBottom: 32,
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
    color: '#8E8E93',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 32,
    marginBottom: 16,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
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
    backgroundColor: '#FFF',
    borderRadius: 20,
    minWidth: 100,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  timerActive: {
    color: '#FF3B30',
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
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chapterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 32,
    marginVertical: 12,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  chapterButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  chapterModal: {
    backgroundColor: '#FFF',
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
    borderBottomColor: '#E5E5EA',
  },
  chapterModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
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
    borderBottomColor: '#F2F2F7',
  },
  chapterItemActive: {
    backgroundColor: '#F2F2F7',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterNumber: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  chapterName: {
    fontSize: 14,
    color: '#000',
  },
  timerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerDialog: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
  },
  timerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  timerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  timerOption: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F2F2F7',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  timerOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  timerCancelButton: {
    backgroundColor: '#F2F2F7',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
