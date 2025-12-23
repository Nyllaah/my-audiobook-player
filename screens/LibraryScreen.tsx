import { useAudiobook } from '@/context/AudiobookContext';
import { storageService } from '@/services/storageService';
import { Audiobook } from '@/types/audiobook';
import { detectAudiobookTitle, sortAudioFiles } from '@/utils/audiobookParser';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState, useMemo } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

export default function LibraryScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { audiobooks, isLoading, addAudiobook, removeAudiobook, playAudiobook, refreshLibrary, currentBook, setCurrentBook } = useAudiobook();
  
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const [titleDialogVisible, setTitleDialogVisible] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [pendingAudiobook, setPendingAudiobook] = useState<{
    sortedParts: any[];
    detectedTitle: string;
  } | null>(null);
  
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<Audiobook | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editCoverUri, setEditCoverUri] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Audiobook | null>(null);

  const handleConfirmTitle = async () => {
    if (!pendingAudiobook) return;

    const finalTitle = editableTitle.trim() || pendingAudiobook.detectedTitle;
    
    const audiobook: Audiobook = {
      id: Date.now().toString(),
      title: finalTitle,
      uri: pendingAudiobook.sortedParts[0].uri,
      parts: pendingAudiobook.sortedParts,
      addedDate: Date.now(),
      currentPosition: 0,
      currentPart: 0,
    };
    
    await addAudiobook(audiobook);
    setTitleDialogVisible(false);
    setPendingAudiobook(null);
    Alert.alert('Success!', `Added "${finalTitle}" with ${pendingAudiobook.sortedParts.length} parts`);
  };

  const handleCancelTitle = () => {
    setTitleDialogVisible(false);
    setPendingAudiobook(null);
  };

  const handleEditBook = (book: Audiobook) => {
    setEditingBook(book);
    setEditTitle(book.title || '');
    setEditAuthor(book.author || '');
    setEditCoverUri(book.artwork || null);
    setEditDialogVisible(true);
  };

  const handlePickCover = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access photos is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setEditCoverUri(result.assets[0].uri);
    }
  };

  const handleRemoveCover = () => {
    setEditCoverUri(null);
  };

  const handleSaveEdit = async () => {
    if (!editingBook) return;

    await storageService.updateAudiobook(editingBook.id, {
      title: editTitle.trim() || editingBook.title,
      author: editAuthor.trim(),
      artwork: editCoverUri || undefined,
    });

    await refreshLibrary();
    
    // Update currentBook if we're editing the currently playing book
    if (currentBook?.id === editingBook.id) {
      const books = await storageService.getAudiobooks();
      const updatedBook = books.find(b => b.id === editingBook.id);
      if (updatedBook) {
        setCurrentBook(updatedBook);
      }
    }
    
    setEditDialogVisible(false);
    setEditingBook(null);
    setEditTitle('');
    setEditAuthor('');
    setEditCoverUri(null);
  };

  const handleCancelEdit = () => {
    setEditDialogVisible(false);
    setEditingBook(null);
    setEditTitle('');
    setEditAuthor('');
    setEditCoverUri(null);
  };

  const pickAudioFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled) {
        return;
      }

      if (result.assets && result.assets.length > 0) {
        setIsAdding(true);
        if (result.assets.length === 1) {
          const file = result.assets[0];
          const audiobook: Audiobook = {
            id: Date.now().toString(),
            title: file.name.replace(/\.[^/.]+$/, ''),
            uri: file.uri,
            addedDate: Date.now(),
            currentPosition: 0,
          };
          try {
            await addAudiobook(audiobook);
            setIsAdding(false);
            Alert.alert('Success!', `Added "${audiobook.title}"`);
          } catch (error) {
            setIsAdding(false);
            console.error('Error adding audiobook:', error);
            Alert.alert('Error', 'Failed to add audiobook. Please try again.');
          }
          return;
        }

        const files = result.assets.map(asset => ({
          name: asset.name,
          uri: asset.uri,
        }));

        const sortedParts = sortAudioFiles(files);
        
        const detectedTitle = detectAudiobookTitle(files);

        setIsAdding(false);
        setPendingAudiobook({ sortedParts, detectedTitle });
        setEditableTitle(detectedTitle);
        setTitleDialogVisible(true);
      }
    } catch (error) {
      setIsAdding(false);
      console.error('Error picking audio files:', error);
      Alert.alert('Error', 'Failed to add audiobook');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyTitle}>Loading...</Text>
      </View>
    );
  }

  const handleDeleteBook = (book: Audiobook) => {
    Alert.alert(
      'Delete Audiobook',
      `Are you sure you want to delete "${book.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeAudiobook(book.id),
        },
      ]
    );
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const renderItem = ({ item }: { item: Audiobook }) => {
    if (!item || !item.id) return null;

    const handlePlayBook = async () => {
      await refreshLibrary();
      const updatedBooks = await storageService.getAudiobooks();
      const updatedBook = updatedBooks.find(b => b.id === item.id);
      if (updatedBook) {
        await playAudiobook(updatedBook);
      } else {
        await playAudiobook(item);
      }
      router.push('/player');
    };

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
              <Ionicons name="book-outline" size={32} color="#007AFF" />
            </View>
          )}
        </View>
        <View style={styles.bookInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.title || 'Unknown Title'}
          </Text>
          {item.author ? (
            <Text style={styles.author} numberOfLines={1}>
              {item.author}
            </Text>
          ) : null}
          <View style={styles.metaRow}>
            {item.parts && item.parts.length > 1 ? (
              <Text style={styles.partCount}>
                {t('library.parts', { count: item.parts.length })}
              </Text>
            ) : null}
            {item.duration ? (
              <Text style={styles.duration}>
                {formatDuration(item.duration)}
              </Text>
            ) : null}
          </View>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={(e) => {
            e.stopPropagation();
            setSelectedBook(item);
            setActionMenuVisible(true);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('library.title')}</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={pickAudioFiles}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {audiobooks.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="headset-outline" size={64} color={colors.textTertiary} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>{t('library.empty')}</Text>
          <Text style={styles.subtitle}>{t('library.emptyDescription')}</Text>
          <View style={styles.tipContainer}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
            <Text style={styles.tipText}>
              {t('library.tips.import')}
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={audiobooks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}

      {/* Title Edit Modal */}
      <Modal
        visible={titleDialogVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelTitle}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Audiobook Title</Text>
            
            {pendingAudiobook && (
              <>
                <Text style={styles.modalSubtitle}>
                  {pendingAudiobook.sortedParts.length} files selected
                </Text>
                
                <View style={styles.filePreview}>
                  {pendingAudiobook.sortedParts.slice(0, 3).map((part, i) => (
                    <Text key={i} style={styles.fileName}>
                      {i + 1}. {part.filename}
                    </Text>
                  ))}
                  {pendingAudiobook.sortedParts.length > 3 && (
                    <Text style={styles.fileName}>
                      ...and {pendingAudiobook.sortedParts.length - 3} more
                    </Text>
                  )}
                </View>

                <TextInput
                  style={styles.titleInput}
                  value={editableTitle}
                  onChangeText={setEditableTitle}
                  placeholder="Audiobook title"
                  autoFocus
                  selectTextOnFocus
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={handleCancelTitle}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleConfirmTitle}
                  >
                    <Text style={styles.confirmButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Audiobook Modal */}
      <Modal
        visible={editDialogVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Audiobook</Text>
            
            <Text style={styles.inputLabel}>Cover Image</Text>
            <View style={styles.coverSection}>
              {editCoverUri ? (
                <View style={styles.coverPreview}>
                  <Image source={{ uri: editCoverUri }} style={styles.coverImage} />
                  <TouchableOpacity
                    style={styles.removeCoverButton}
                    onPress={handleRemoveCover}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.noCover}>
                  <Ionicons name="image-outline" size={48} color="#999" />
                  <Text style={styles.noCoverText}>No cover image</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.pickCoverButton}
                onPress={handlePickCover}
              >
                <Ionicons name="images-outline" size={20} color="#007AFF" />
                <Text style={styles.pickCoverText}>
                  {editCoverUri ? 'Change Cover' : 'Add Cover'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.titleInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Audiobook title"
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>Author (Optional)</Text>
            <TextInput
              style={styles.titleInput}
              value={editAuthor}
              onChangeText={setEditAuthor}
              placeholder="Author name"
              autoCapitalize="words"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.confirmButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Action Menu Modal */}
      <Modal
        visible={actionMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.actionMenuOverlay}
          activeOpacity={1}
          onPress={() => setActionMenuVisible(false)}
        >
          <View style={styles.actionMenuContainer}>
            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                setActionMenuVisible(false);
                if (selectedBook) handleEditBook(selectedBook);
              }}
            >
              <Ionicons name="create-outline" size={22} color="#007AFF" />
              <Text style={styles.actionMenuText}>Edit</Text>
            </TouchableOpacity>
            <View style={styles.actionMenuDivider} />
            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                setActionMenuVisible(false);
                if (selectedBook) handleDeleteBook(selectedBook);
              }}
            >
              <Ionicons name="trash-outline" size={22} color="#FF3B30" />
              <Text style={[styles.actionMenuText, { color: '#FF3B30' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Loading Modal */}
      <Modal
        visible={isAdding}
        transparent
        animationType="fade"
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Adding audiobook...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerButton: {
    padding: 4,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.blueLight,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 32,
    marginTop: 8,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: colors.blueDark,
    lineHeight: 18,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.backgroundCard,
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
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  partCount: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  duration: {
    fontSize: 12,
    color: '#999',
  },
  moreButton: {
    padding: 8,
  },
  actionMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionMenuContainer: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    minWidth: 200,
    overflow: 'hidden',
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  actionMenuText: {
    fontSize: 16,
    color: colors.text,
  },
  actionMenuDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  filePreview: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  fileName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  coverSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  coverPreview: {
    position: 'relative',
    marginBottom: 12,
  },
  coverImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  removeCoverButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  noCover: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  noCoverText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  pickCoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  pickCoverText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: colors.text,
    backgroundColor: colors.backgroundLight,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
});
