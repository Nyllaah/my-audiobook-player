import {
  ChapterListModal,
  NoteEditorModal,
  NotesListModal,
  PlayerArtwork,
  PlayerChapterButton,
  PlayerEmptyState,
  PlayerPlaybackControls,
  PlayerProgress,
  PlayerSecondaryControls,
  PlayerTrackInfo,
  SleepTimerModal
} from '@/components/player';
import { DarkColors, LightColors } from '@/constants/colors';
import { useAudiobook } from '@/context/AudiobookContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { useSleepTimer } from '@/hooks/useSleepTimer';
import { storageService } from '@/services/storageService';
import { AudiobookBookmark } from '@/types/bookmark';
import { AudiobookNote } from '@/types/note';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [showNotesList, setShowNotesList] = useState(false);
  const [notes, setNotes] = useState<AudiobookNote[]>([]);
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [showBookmarksList, setShowBookmarksList] = useState(false);
  const [bookmarks, setBookmarks] = useState<AudiobookBookmark[]>([]);

  const loadNotes = useCallback(async () => {
    if (!currentBook) return;
    const list = await storageService.getNotes(currentBook.id);
    setNotes(list);
  }, [currentBook]);

  const loadBookmarks = useCallback(async () => {
    if (!currentBook) return;
    const list = await storageService.getBookmarks(currentBook.id);
    setBookmarks(list);
  }, [currentBook]);

  useEffect(() => {
    if (currentBook) loadNotes();
  }, [currentBook, loadNotes]);

  useEffect(() => {
    if (currentBook) loadBookmarks();
  }, [currentBook, loadBookmarks]);

  const handleTimerEnd = useCallback(async () => {
    await togglePlayPause();
  }, [togglePlayPause]);

  const { sleepTimerRemainingMs, setSleepTimer, cancelTimer } =
    useSleepTimer(handleTimerEnd);

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

  const handleNotePress = useCallback(async () => {
    if (playbackState.isPlaying) {
      await togglePlayPause();
    }
    setShowNoteEditor(true);
  }, [playbackState.isPlaying, togglePlayPause]);

  const handleSaveNote = useCallback(
    async (text: string) => {
      if (!currentBook) return;
      await storageService.addNote({
        audiobookId: currentBook.id,
        positionSeconds: Math.floor(playbackState.position),
        text,
      });
      setShowNoteEditor(false);
      await loadNotes();
    },
    [currentBook, playbackState.position, loadNotes]
  );

  const handleSeekToNote = useCallback(
    async (positionSeconds: number) => {
      await seekTo(positionSeconds);
      setShowNotesList(false);
    },
    [seekTo]
  );

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      await storageService.deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    },
    []
  );

  const handleClose = useCallback(async () => {
    await saveCurrentProgress();
    if (router.canGoBack?.()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [saveCurrentProgress, router]);

  if (!currentBook) {
    return (
      <View style={styles.container}>
        <PlayerEmptyState
          onGoToLibrary={() => {
            if (router.canGoBack?.()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          }}
        />
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

      <View style={styles.content}>
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
          playbackRate={playbackState.playbackRate}
          onCyclePlaybackRate={cyclePlaybackRate}
          sleepTimerRemainingMs={sleepTimerRemainingMs}
          onTimerPress={() => setShowTimerDialog(true)}
          onCancelTimer={cancelTimer}
        />

        <PlayerSecondaryControls
          onNotePress={handleNotePress}
          notesCount={notes.length}
          onBookmarkPress={() => setShowBookmarksList(true)}
          bookmarksCount={bookmarks.length}
        />

        <TouchableOpacity
          style={styles.viewNotesLink}
          onPress={() => setShowNotesList(true)}
        >
          <Text style={styles.viewNotesText}>{t('player.viewNotes')}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.primaryOrange} />
        </TouchableOpacity>
      </View>

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

      <NoteEditorModal
        visible={showNoteEditor}
        positionSeconds={Math.floor(playbackState.position)}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        placeholder={t('player.notePlaceholder')}
        onSave={handleSaveNote}
        onClose={() => setShowNoteEditor(false)}
      />

      <NotesListModal
        visible={showNotesList}
        notes={notes}
        title={t('player.notesTitle')}
        emptyMessage={t('player.notesEmpty')}
        deleteLabel={t('common.delete')}
        closeLabel={t('common.close')}
        onSeekToPosition={handleSeekToNote}
        onDeleteNote={handleDeleteNote}
        onClose={() => setShowNotesList(false)}
      />
    </View>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 36,
      paddingBottom: 24,
    },
    closeButton: {
      paddingHorizontal: 16,
      alignSelf: 'flex-start',
      marginBottom: 8,
    },
    content: {
      flex: 1,
      justifyContent: 'space-between',
      paddingHorizontal: 16,
    },
    viewNotesLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    viewNotesText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.primaryOrange,
    },
  });
