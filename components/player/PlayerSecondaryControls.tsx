import { DarkColors, LightColors } from '@/constants/colors';
import { useAudiobook } from '@/context/AudiobookContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { storageService } from '@/services/storageService';
import { AudiobookBookmark } from '@/types/bookmark';
import { AudiobookNote } from '@/types/note';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AddBookmarkModal } from './AddBookmarkModal';
import { BookmarkListModal } from './BookmarkListModal';
import { NoteEditorModal } from './NoteEditorModal';
import { NotesListModal } from './NotesListModal';

export function PlayerSecondaryControls() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const {
    currentBook,
    playbackState,
    seekTo,
    togglePlayPause,
  } = useAudiobook();

  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [showNotesList, setShowNotesList] = useState(false);
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [showBookmarksList, setShowBookmarksList] = useState(false);
  const [notes, setNotes] = useState<AudiobookNote[]>([]);
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

  const handleNotePress = useCallback(async () => {
    if (playbackState.isPlaying) await togglePlayPause();
    setShowNoteEditor(true);
  }, [playbackState.isPlaying, togglePlayPause]);

  const handleBookmarkPress = useCallback(() => {
    setShowAddBookmark(true);
  }, []);

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

  const handleDeleteNote = useCallback(async (noteId: string) => {
    await storageService.deleteNote(noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  const handleAddBookmark = useCallback(
    async (label?: string) => {
      if (!currentBook) return;
      await storageService.addBookmark({
        audiobookId: currentBook.id,
        positionSeconds: Math.floor(playbackState.position),
        label,
      });
      setShowAddBookmark(false);
      await loadBookmarks();
    },
    [currentBook, playbackState.position, loadBookmarks]
  );

  const handleSeekToBookmark = useCallback(
    async (positionSeconds: number) => {
      await seekTo(positionSeconds);
      setShowBookmarksList(false);
    },
    [seekTo]
  );

  const handleDeleteBookmark = useCallback(async (bookmarkId: string) => {
    await storageService.deleteBookmark(bookmarkId);
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
  }, []);

  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!currentBook) return null;

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={handleNotePress}>
          <Ionicons name="create-outline" size={20} color={colors.primaryOrange} />
          <Text style={styles.buttonText}>
            {notes.length > 0 ? `(${notes.length})` : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleBookmarkPress}>
          <Ionicons name="bookmark-outline" size={20} color={colors.primaryOrange} />
          <Text style={styles.buttonText}>
            {bookmarks.length > 0 ? `(${bookmarks.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.viewNotesLink}
        onPress={() => setShowNotesList(true)}
      >
        <Text style={styles.viewNotesText}>{t('player.viewNotes')}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.primaryOrange} />
      </TouchableOpacity>

      <NoteEditorModal
        visible={showNoteEditor}
        positionSeconds={Math.floor(playbackState.position)}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        placeholder={t('player.notePlaceholder')}
        viewNotesLabel={t('player.viewNotes')}
        onSave={handleSaveNote}
        onClose={() => setShowNoteEditor(false)}
        onViewNotes={() => {
          setShowNoteEditor(false);
          setShowNotesList(true);
        }}
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

      <AddBookmarkModal
        visible={showAddBookmark}
        positionSeconds={Math.floor(playbackState.position)}
        addLabel={t('player.addBookmark')}
        cancelLabel={t('common.cancel')}
        placeholder={t('player.bookmarkLabelPlaceholder')}
        viewBookmarksLabel={t('player.viewBookmarks')}
        onAdd={handleAddBookmark}
        onClose={() => setShowAddBookmark(false)}
        onViewBookmarks={() => {
          setShowAddBookmark(false);
          setShowBookmarksList(true);
        }}
      />

      <BookmarkListModal
        visible={showBookmarksList}
        bookmarks={bookmarks}
        title={t('player.bookmarksTitle')}
        emptyMessage={t('player.bookmarksEmpty')}
        onSeekToPosition={handleSeekToBookmark}
        onDeleteBookmark={handleDeleteBookmark}
        onClose={() => setShowBookmarksList(false)}
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
      minWidth: 75,
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
