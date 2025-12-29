import { AudiobookListItem } from '@/components/AudiobookListItem';
import { DarkColors, LightColors } from '@/constants/colors';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { useAudiobook } from '@/context/AudiobookContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { storageService } from '@/services/storageService';
import { Audiobook } from '@/types/audiobook';
import { detectAudiobookTitle, sortAudioFiles } from '@/utils/audiobookParser';
import { isImageFile } from '@/utils/fileUtils';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LibraryScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { audiobooks, isLoading, addAudiobook, removeAudiobook, refreshLibrary, currentBook, setCurrentBook } = useAudiobook();
  
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const [titleDialogVisible, setTitleDialogVisible] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [pendingCoverUri, setPendingCoverUri] = useState<string | null>(null);
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
  const menuPositionRef = useRef({ x: 0, y: 0 });

  const hasSeenImportInfo = async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.IMPORT_INFO_SEEN);
      return value === 'true';
    } catch (error) {
      console.error('Failed to check import info status:', error);
      return false;
    }
  };

  const markImportInfoAsSeen = async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IMPORT_INFO_SEEN, 'true');
    } catch (error) {
      console.error('Failed to mark import info as seen:', error);
    }
  };

  const showImportInfoDialog = (onContinue: () => void): void => {
    Alert.alert(
      t('modals.importInfo.title'),
      t('modals.importInfo.message'),
      [
        {
          text: t('modals.cancel'),
          style: 'cancel',
          onPress: () => {},
        },
        {
          text: t('common.ok'),
          onPress: async () => {
            await markImportInfoAsSeen();
            onContinue();
          },
        },
      ],
      { cancelable: true, onDismiss: () => {} }
    );
  };

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
      artwork: pendingCoverUri || undefined,
    };
    
    await addAudiobook(audiobook);
    setTitleDialogVisible(false);
    setPendingAudiobook(null);
    setPendingCoverUri(null);
    Alert.alert('Success!', `Added "${finalTitle}" with ${pendingAudiobook.sortedParts.length} parts`);
  };

  const handleCancelTitle = () => {
    setTitleDialogVisible(false);
    setPendingAudiobook(null);
    setPendingCoverUri(null);
  };


  const handlePickPendingCover = async () => {
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
      setPendingCoverUri(result.assets[0].uri);
    }
  };

  const handleRemovePendingCover = () => {
    setPendingCoverUri(null);
  };

  const handleEditBook = useCallback((book: Audiobook) => {
    setEditingBook(book);
    setEditTitle(book.title || '');
    setEditAuthor(book.author || '');
    setEditCoverUri(book.artwork || null);
    setEditDialogVisible(true);
  }, []);

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

  const doPickAudioFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Allow all file types to detect images
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled) {
        return;
      }

      if (result.assets && result.assets.length > 0) {
        setIsAdding(true);
        
        // Separate audio files and image files
        const allFiles = result.assets.map(asset => ({
          name: asset.name,
          uri: asset.uri,
        }));
        
        const audioFiles = allFiles.filter(file => !isImageFile(file.name));
        const imageFiles = allFiles.filter(file => isImageFile(file.name));
        
        // Auto-set first image as cover if found
        const autoCoverUri = imageFiles.length > 0 ? imageFiles[0].uri : null;
        
        if (audioFiles.length === 0) {
          setIsAdding(false);
          Alert.alert('Error', 'No audio files selected. Please select at least one audio file.');
          return;
        }
        
        if (audioFiles.length === 1) {
          const file = audioFiles[0];
          const audiobook: Audiobook = {
            id: Date.now().toString(),
            title: file.name.replace(/\.[^/.]+$/, ''),
            uri: file.uri,
            addedDate: Date.now(),
            currentPosition: 0,
            artwork: autoCoverUri || undefined,
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

        const sortedParts = sortAudioFiles(audioFiles);
        
        const detectedTitle = detectAudiobookTitle(audioFiles);

        setIsAdding(false);
        setPendingAudiobook({ sortedParts, detectedTitle });
        setEditableTitle(detectedTitle);
        setPendingCoverUri(autoCoverUri);
        setTitleDialogVisible(true);
      }
    } catch (error) {
      setIsAdding(false);
      console.error('Error picking audio files:', error);
      Alert.alert('Error', 'Failed to add audiobook');
    }
  };

  const handleShowMenu = useCallback((book: Audiobook, position: { x: number; y: number }) => {
    menuPositionRef.current = position;
    setSelectedBook(book);
    setActionMenuVisible(true);
  }, []);

  const handleDeleteBook = useCallback((book: Audiobook) => {
    Alert.alert(
      t('library.deleteConfirm.title'),
      t('library.deleteConfirm.message', { title: book.title }),
      [
        { text: t('modals.cancel'), style: 'cancel' },
        {
          text: t('library.actions.delete'),
          style: 'destructive',
          onPress: () => removeAudiobook(book.id),
        },
      ]
    );
  }, [t, removeAudiobook]);

  const renderItem = useCallback(({ item }: { item: Audiobook }) => {
    if (!item || !item.id) return null;
    
    return (
      <AudiobookListItem
        item={item}
        onDelete={handleDeleteBook}
        onEdit={handleEditBook}
        onShowMenu={handleShowMenu}
      />
    );
  }, [handleDeleteBook, handleEditBook, handleShowMenu]);

  const keyExtractor = useCallback((item: Audiobook) => item.id, []);

  const pickAudioFiles = async () => {
    const hasSeen = await hasSeenImportInfo();
    if (!hasSeen) {
      showImportInfoDialog(() => {
        doPickAudioFiles();
      });
    } else {
      doPickAudioFiles();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyTitle}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Image source={require('@/assets/images/narria-logo.png')} style={styles.logo} />
        <TouchableOpacity
          style={styles.headerButton}
          onPress={pickAudioFiles}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color={colors.primaryOrange} />
        </TouchableOpacity>
      </View>

      {audiobooks.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="headset-outline" size={64} color={colors.textTertiary} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>{t('library.empty')}</Text>
          <Text style={styles.subtitle}>{t('library.emptyDescription')}</Text>
          <View style={styles.tipContainer}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primaryOrange} />
            <Text style={styles.tipText}>
              {t('library.tips.import')}
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={audiobooks}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          removeClippedSubviews
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
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
            <Text style={styles.modalTitle}>{t('modals.editAudiobookTitle')}</Text>
            
            {pendingAudiobook && (
              <>
                <Text style={styles.modalSubtitle}>
                  {t('modals.filesSelected', { count: pendingAudiobook.sortedParts.length })}
                </Text>
                
                <View style={styles.filePreview}>
                  {pendingAudiobook.sortedParts.slice(0, 3).map((part, i) => (
                    <Text key={i} style={styles.fileName}>
                      {i + 1}. {part.filename}
                    </Text>
                  ))}
                  {pendingAudiobook.sortedParts.length > 3 && (
                    <Text style={styles.fileName}>
                      {t('modals.andMore', { count: pendingAudiobook.sortedParts.length - 3 })}
                    </Text>
                  )}
                </View>

                <Text style={styles.inputLabel}>{t('modals.pickCover')}</Text>
                <View style={styles.coverSection}>
                  {pendingCoverUri ? (
                    <View style={styles.coverPreview}>
                      <Image source={{ uri: pendingCoverUri }} style={styles.coverImage} />
                      <TouchableOpacity
                        style={styles.removeCoverButton}
                        onPress={handleRemovePendingCover}
                      >
                        <Ionicons name="close-circle" size={24} color={colors.primaryOrange} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.noCover}>
                      <Ionicons name="image-outline" size={48} color={colors.textTertiary} />
                      <Text style={styles.noCoverText}>{t('modals.pickCover')}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.pickCoverButton}
                    onPress={handlePickPendingCover}
                  >
                    <Ionicons name="images-outline" size={20} color={colors.primaryOrange} />
                    <Text style={styles.pickCoverText}>
                      {t('modals.pickCover')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>{t('modals.title')}</Text>
                <TextInput
                  style={styles.titleInput}
                  value={editableTitle}
                  onChangeText={setEditableTitle}
                  placeholder={t('modals.enterTitle')}
                  autoFocus
                  selectTextOnFocus
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={handleCancelTitle}
                  >
                    <Text style={styles.cancelButtonText}>{t('modals.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleConfirmTitle}
                  >
                    <Text style={styles.confirmButtonText}>{t('modals.add')}</Text>
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
            <Text style={styles.modalTitle}>{t('modals.editAudiobook')}</Text>
            
            <Text style={styles.inputLabel}>{t('modals.pickCover')}</Text>
            <View style={styles.coverSection}>
              {editCoverUri ? (
                <View style={styles.coverPreview}>
                  <Image source={{ uri: editCoverUri }} style={styles.coverImage} />
                  <TouchableOpacity
                    style={styles.removeCoverButton}
                    onPress={handleRemoveCover}
                  >
                    <Ionicons name="close-circle" size={24} color={colors.primaryOrange} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.noCover}>
                  <Ionicons name="image-outline" size={48} color={colors.textTertiary} />
                  <Text style={styles.noCoverText}>{t('modals.pickCover')}</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.pickCoverButton}
                onPress={handlePickCover}
              >
                <Ionicons name="images-outline" size={20} color={colors.primaryOrange} />
                <Text style={styles.pickCoverText}>
                  {t('modals.pickCover')}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>{t('modals.title')}</Text>
            <TextInput
              style={styles.titleInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder={t('modals.enterTitle')}
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>{t('modals.author')}</Text>
            <TextInput
              style={styles.titleInput}
              value={editAuthor}
              onChangeText={setEditAuthor}
              placeholder={t('modals.author')}
              autoCapitalize="words"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>{t('modals.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.confirmButtonText}>{t('modals.save')}</Text>
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
          <View style={[styles.actionMenuContainer, { position: 'absolute', top: menuPositionRef.current.y - 50, left: menuPositionRef.current.x - 150 }]}>
            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                setActionMenuVisible(false);
                if (selectedBook) handleEditBook(selectedBook);
              }}
            >
              <Ionicons name="create-outline" size={22} color={colors.primaryOrange} />
              <Text style={styles.actionMenuText}>{t('library.actions.edit')}</Text>
            </TouchableOpacity>
            <View style={styles.actionMenuDivider} />
            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                setActionMenuVisible(false);
                if (selectedBook) handleDeleteBook(selectedBook);
              }}
            >
              <Ionicons name="trash-outline" size={22} color={colors.primaryOrange} />
              <Text style={[styles.actionMenuText, { color: colors.red }]}>{t('library.actions.delete')}</Text>
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
            <ActivityIndicator size="large" color={colors.primaryOrange} />
            <Text style={styles.loadingText}>Adding audiobook...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) => StyleSheet.create({
  logo: {
    width: 110,
    height: 40,
    resizeMode: 'contain',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    backgroundColor: colors.primaryBlue,
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
    color: colors.textSecondary,
    marginBottom: 24,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundLight,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 32,
    marginTop: 8,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
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
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  partCount: {
    fontSize: 12,
    color: colors.primaryOrange,
    fontWeight: '600',
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
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
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
    backgroundColor: colors.backgroundLight,
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
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  fileName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
    backgroundColor: colors.background,
  },
  removeCoverButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.backgroundLight,
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
    color: colors.textLight,
    marginTop: 8,
    textAlign: 'center',
    justifyContent: 'center',
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
    color: colors.primaryOrange,
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
    backgroundColor: colors.background,
  },
  confirmButton: {
    backgroundColor: colors.primaryOrange,
  },
  cancelButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: colors.white,
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
    backgroundColor: colors.backgroundLight,
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
