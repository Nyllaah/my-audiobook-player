import { DarkColors, LightColors } from '@/constants/colors';
import { useAudiobook } from '@/context/AudiobookContext';
import { useTheme } from '@/context/ThemeContext';
import { Audiobook } from '@/types/audiobook';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { memo, useCallback, useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { storageService } from '@/services/storageService';

interface AudiobookListItemProps {
  item: Audiobook;
  onDelete: (book: Audiobook) => void;
  onEdit: (book: Audiobook) => void;
  onShowMenu: (book: Audiobook, position: { x: number; y: number }) => void;
}

function AudiobookListItemComponent({
  item,
  onDelete,
  onEdit,
  onShowMenu
}: AudiobookListItemProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { playAudiobook, refreshLibrary } = useAudiobook();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePlayBook = useCallback(async () => {
    await refreshLibrary();
    const updatedBooks = await storageService.getAudiobooks();
    const updatedBook = updatedBooks.find(b => b.id === item.id);
    if (updatedBook) {
      await playAudiobook(updatedBook);
    } else {
      await playAudiobook(item);
    }
    router.push('/player');
  }, [item, playAudiobook, refreshLibrary, router]);

  const handleMorePress = useCallback((event: { nativeEvent: { pageX: number; pageY: number } }) => {
    const { pageX, pageY } = event.nativeEvent;
    onShowMenu(item, { x: pageX, y: pageY });
  }, [item, onShowMenu]);

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={handlePlayBook}
      activeOpacity={0.7}
    >
      <View style={styles.coverContainer}>
        {item.artwork ? (
          <Image source={{ uri: item.artwork }} style={styles.coverThumbnail} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="book-outline" size={32} color={colors.primaryOrange} />
          </View>
        )}
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.author && (
          <Text style={styles.author} numberOfLines={1}>
            {item.author}
          </Text>
        )}
        {item.parts && item.parts.length > 1 && (
          <View style={styles.metaRow}>
            <Text style={styles.partCount}>
              {item.parts.length} {item.parts.length === 1 ? 'part' : 'parts'}
            </Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        style={styles.moreButton}
        onPress={handleMorePress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={colors.textTertiary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export const AudiobookListItem = memo(AudiobookListItemComponent);

const createStyles = (colors: typeof LightColors | typeof DarkColors) => StyleSheet.create({
  item: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.backgroundLight,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  coverContainer: {
    marginRight: 12,
  },
  coverThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  coverPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  author: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  partCount: {
    fontSize: 12,
    color: colors.primaryOrange,
    fontWeight: '600',
  },
  moreButton: {
    padding: 8,
  },
});
