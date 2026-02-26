import { DarkColors, LightColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import { AudiobookBookmark } from '@/types/bookmark';
import { formatTime } from '@/utils/timeFormatter';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type BookmarkListModalProps = {
  visible: boolean;
  bookmarks: AudiobookBookmark[];
  title: string;
  emptyMessage: string;
  onSeekToPosition: (positionSeconds: number) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
  onClose: () => void;
};

export function BookmarkListModal({
  visible,
  bookmarks,
  title,
  emptyMessage,
  onSeekToPosition,
  onDeleteBookmark,
  onClose,
}: BookmarkListModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const renderItem = ({ item }: { item: AudiobookBookmark }) => (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.content}
        onPress={() => onSeekToPosition(item.positionSeconds)}
        activeOpacity={0.7}
      >
        <Text style={styles.positionText}>{formatTime(item.positionSeconds)}</Text>
        <Text style={styles.labelText} numberOfLines={3}>
          {item.text}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDeleteBookmark(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={22} color={colors.red} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>
          {bookmarks.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="bookmark-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
          ) : (
            <FlatList
              data={bookmarks}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: colors.backgroundLight,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    listContent: {
      padding: 16,
      paddingBottom: 32,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    content: {
      flex: 1,
    },
    positionText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primaryOrange,
      marginBottom: 6,
    },
    labelText: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
    },
    deleteButton: {
      padding: 8,
      marginLeft: 8,
    },
    empty: {
      padding: 48,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 16,
      textAlign: 'center',
    },
  });
