import { DarkColors, LightColors } from '@/constants/colors';
import { useAudiobook } from '@/context/AudiobookContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { storageService } from '@/services/storageService';
import { AudiobookBookmark } from '@/types/bookmark';
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

export function PlayerSecondaryControls() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const {
    currentBook,
    playbackState,
    seekTo,
    togglePlayPause,
  } = useAudiobook();

  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [showBookmarksList, setShowBookmarksList] = useState(false);
  const [bookmarks, setBookmarks] = useState<AudiobookBookmark[]>([]);

  const loadBookmarks = useCallback(async () => {
    if (!currentBook) return;
    const list = await storageService.getBookmarks(currentBook.id);
    setBookmarks(list);
  }, [currentBook]);

  useEffect(() => {
    if (currentBook) loadBookmarks();
  }, [currentBook, loadBookmarks]);

  const handleBookmarkPress = useCallback(async () => {
    if (playbackState.isPlaying) await togglePlayPause();
    setShowAddBookmark(true);
  }, [playbackState.isPlaying, togglePlayPause]);

  const handleSaveBookmark = useCallback(
    async (text: string) => {
      if (!currentBook) return;
      await storageService.addBookmark({
        audiobookId: currentBook.id,
        positionSeconds: Math.floor(playbackState.position),
        text,
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
        <TouchableOpacity style={styles.button} onPress={handleBookmarkPress}>
          <Ionicons name="bookmark-outline" size={20} color={colors.primaryOrange} />
          <Text style={styles.buttonText}>
            {bookmarks.length > 0 ? `(${bookmarks.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.viewBookmarksLink}
        onPress={() => setShowBookmarksList(true)}
      >
        <Text style={styles.viewBookmarksText}>{t('player.viewBookmarks')}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.primaryOrange} />
      </TouchableOpacity>

      <AddBookmarkModal
        visible={showAddBookmark}
        positionSeconds={Math.floor(playbackState.position)}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        placeholder={t('player.bookmarkPlaceholder')}
        viewBookmarksLabel={t('player.viewBookmarks')}
        onSave={handleSaveBookmark}
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
    viewBookmarksLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    viewBookmarksText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.primaryOrange,
    },
  });
