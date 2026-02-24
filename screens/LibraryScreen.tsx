import {
  ActionMenuModal,
  AudiobookListItem,
  EditAudiobookModal,
  ImportTitleModal,
  LibraryEmptyState,
  LibraryHeader,
  LoadingOverlay,
} from '@/components/library';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { useAudiobook } from '@/context/AudiobookContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { audioPlayerService } from '@/services/audioPlayerService';
import { storageService } from '@/services/storageService';
import { Audiobook } from '@/types/audiobook';
import { getArtworkUriFromAudioFile } from '@/utils/audioMetadata';
import { detectAudiobookTitle, sortAudioFiles } from '@/utils/audiobookParser';
import { copyCoverToAppStorage, deleteStoredCover } from '@/utils/coverStorage';
import { isImageFile } from '@/utils/fileUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  findNodeHandle,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function LibraryScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const {
    audiobooks,
    isLoading,
    addAudiobook,
    removeAudiobook,
    refreshLibrary,
    currentBook,
    setCurrentBook,
  } = useAudiobook();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const [titleDialogVisible, setTitleDialogVisible] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [pendingCoverUri, setPendingCoverUri] = useState<string | null>(null);
  const [pendingAudiobook, setPendingAudiobook] = useState<{
    sortedParts: { uri: string; filename: string; partNumber?: number; duration?: number }[];
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

  const titleModalScrollRef = useRef<ScrollView>(null);
  const titleModalContentRef = useRef<View>(null);
  const titleInputWrapperRef = useRef<View>(null);
  const editModalScrollRef = useRef<ScrollView>(null);
  const editModalContentRef = useRef<View>(null);
  const editTitleWrapperRef = useRef<View>(null);
  const editAuthorWrapperRef = useRef<View>(null);

  const scrollFocusedInputIntoView = useCallback(
    (
      scrollRef: React.RefObject<ScrollView | null>,
      contentRef: React.RefObject<View | null>,
      inputWrapperRef: React.RefObject<View | null>,
      paddingFromTop = 80
    ) => {
      const run = () => {
        if (!scrollRef.current || !contentRef.current || !inputWrapperRef.current) return;
        const contentNode = findNodeHandle(contentRef.current);
        if (contentNode == null) return;
        inputWrapperRef.current.measureLayout(
          contentNode,
          (_x, y, _w, _h) => {
            scrollRef.current?.scrollTo({
              y: Math.max(0, 24 + y - paddingFromTop),
              animated: true,
            });
          },
          () => {}
        );
      };
      setTimeout(run, 350);
    },
    []
  );

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
        { text: t('modals.cancel'), style: 'cancel', onPress: () => {} },
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
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPendingCoverUri(result.assets[0].uri);
    }
  };

  const handleRemovePendingCover = () => setPendingCoverUri(null);

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
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setEditCoverUri(result.assets[0].uri);
    }
  };

  const handleRemoveCover = () => setEditCoverUri(null);

  const handleSaveEdit = async () => {
    if (!editingBook) return;

    let artworkToSave: string | undefined;
    if (editCoverUri) {
      const permanentUri = await copyCoverToAppStorage(editCoverUri, editingBook.id);
      artworkToSave = permanentUri ?? editCoverUri;
    } else {
      deleteStoredCover(editingBook.artwork);
      artworkToSave = undefined;
    }

    await storageService.updateAudiobook(editingBook.id, {
      title: editTitle.trim() || editingBook.title,
      author: editAuthor.trim(),
      artwork: artworkToSave,
    });

    await refreshLibrary();

    if (currentBook?.id === editingBook.id) {
      const books = await storageService.getAudiobooks();
      const updatedBook = books.find((b) => b.id === editingBook.id);
      if (updatedBook) setCurrentBook(updatedBook);
      await audioPlayerService.updateCurrentTrackArtwork(artworkToSave);
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
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled) return;

      if (result.assets && result.assets.length > 0) {
        setIsAdding(true);

        const allFiles = result.assets.map((asset) => ({ name: asset.name, uri: asset.uri }));
        const audioFiles = allFiles.filter((file) => !isImageFile(file.name));
        const imageFiles = allFiles.filter((file) => isImageFile(file.name));
        const autoCoverUri = imageFiles.length > 0 ? imageFiles[0].uri : null;

        if (audioFiles.length === 0) {
          setIsAdding(false);
          Alert.alert('Error', 'No audio files selected. Please select at least one audio file.');
          return;
        }

        if (audioFiles.length === 1) {
          const file = audioFiles[0];
          let coverUri = autoCoverUri;
          if (!coverUri) {
            try {
              coverUri = (await getArtworkUriFromAudioFile(file.uri)) ?? null;
            } catch {
              // ignore
            }
          }
          const audiobook: Audiobook = {
            id: Date.now().toString(),
            title: file.name.replace(/\.[^/.]+$/, ''),
            uri: file.uri,
            addedDate: Date.now(),
            currentPosition: 0,
            artwork: coverUri ?? undefined,
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
        let coverFromMetadata: string | null = autoCoverUri;
        if (!coverFromMetadata) {
          try {
            const uri = await getArtworkUriFromAudioFile(sortedParts[0].uri);
            coverFromMetadata = uri ?? null;
          } catch {
            // ignore
          }
        }

        setIsAdding(false);
        setPendingAudiobook({ sortedParts, detectedTitle });
        setEditableTitle(detectedTitle);
        setPendingCoverUri(coverFromMetadata);
        setTitleDialogVisible(true);
      }
    } catch (error) {
      setIsAdding(false);
      console.error('Error picking audio files:', error);
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert(
        'Error',
        message.includes('FileNotFoundException') || message.includes('Cello error')
          ? 'Could not read the selected file(s). Try choosing the file again or a different folder.'
          : 'Failed to add audiobook. Please try again.'
      );
    }
  };

  const handleShowMenu = useCallback((book: Audiobook, position: { x: number; y: number }) => {
    menuPositionRef.current = position;
    setSelectedBook(book);
    setActionMenuVisible(true);
  }, []);

  const handleDeleteBook = useCallback(
    (book: Audiobook) => {
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
    },
    [t, removeAudiobook]
  );

  const renderItem = useCallback(
    ({ item }: { item: Audiobook }) => {
      if (!item?.id) return null;
      return (
        <AudiobookListItem
          item={item}
          onDelete={handleDeleteBook}
          onEdit={handleEditBook}
          onShowMenu={handleShowMenu}
        />
      );
    },
    [handleDeleteBook, handleEditBook, handleShowMenu]
  );

  const keyExtractor = useCallback((item: Audiobook) => item.id, []);

  const pickAudioFiles = async () => {
    const hasSeen = await hasSeenImportInfo();
    if (!hasSeen) {
      showImportInfoDialog(() => doPickAudioFiles());
    } else {
      doPickAudioFiles();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingTitle}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LibraryHeader onAddPress={pickAudioFiles} />

      {audiobooks.length === 0 ? (
        <LibraryEmptyState
          emptyTitle={t('library.empty')}
          description={t('library.emptyDescription')}
          tipText={t('library.tips.import')}
        />
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

      <ImportTitleModal
        visible={titleDialogVisible}
        pendingAudiobook={pendingAudiobook}
        pendingCoverUri={pendingCoverUri}
        editableTitle={editableTitle}
        onTitleChange={setEditableTitle}
        onPickCover={handlePickPendingCover}
        onRemoveCover={handleRemovePendingCover}
        onConfirm={handleConfirmTitle}
        onCancel={handleCancelTitle}
        scrollRef={titleModalScrollRef}
        contentRef={titleModalContentRef}
        titleInputWrapperRef={titleInputWrapperRef}
        onTitleFocus={() =>
          scrollFocusedInputIntoView(
            titleModalScrollRef,
            titleModalContentRef,
            titleInputWrapperRef
          )
        }
        labels={{
          title: t('modals.editAudiobookTitle'),
          filesSelected: pendingAudiobook
            ? t('modals.filesSelected', { count: pendingAudiobook.sortedParts.length })
            : '',
          andMore:
            pendingAudiobook && pendingAudiobook.sortedParts.length > 3
              ? t('modals.andMore', { count: pendingAudiobook.sortedParts.length - 3 })
              : '',
          pickCover: t('modals.pickCover'),
          titleLabel: t('modals.title'),
          enterTitle: t('modals.enterTitle'),
          cancel: t('modals.cancel'),
          add: t('modals.add'),
        }}
      />

      <EditAudiobookModal
        visible={editDialogVisible}
        editCoverUri={editCoverUri}
        editTitle={editTitle}
        editAuthor={editAuthor}
        onTitleChange={setEditTitle}
        onAuthorChange={setEditAuthor}
        onPickCover={handlePickCover}
        onRemoveCover={handleRemoveCover}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
        scrollRef={editModalScrollRef}
        contentRef={editModalContentRef}
        titleWrapperRef={editTitleWrapperRef}
        authorWrapperRef={editAuthorWrapperRef}
        onTitleFocus={() =>
          scrollFocusedInputIntoView(
            editModalScrollRef,
            editModalContentRef,
            editTitleWrapperRef
          )
        }
        onAuthorFocus={() =>
          scrollFocusedInputIntoView(
            editModalScrollRef,
            editModalContentRef,
            editAuthorWrapperRef
          )
        }
        labels={{
          title: t('modals.editAudiobook'),
          pickCover: t('modals.pickCover'),
          titleLabel: t('modals.title'),
          enterTitle: t('modals.enterTitle'),
          authorLabel: t('modals.author'),
          cancel: t('modals.cancel'),
          save: t('modals.save'),
        }}
      />

      <ActionMenuModal
        visible={actionMenuVisible}
        position={menuPositionRef.current}
        onEdit={() => {
          setActionMenuVisible(false);
          if (selectedBook) handleEditBook(selectedBook);
        }}
        onDelete={() => {
          setActionMenuVisible(false);
          if (selectedBook) handleDeleteBook(selectedBook);
        }}
        onClose={() => setActionMenuVisible(false)}
        editLabel={t('library.actions.edit')}
        deleteLabel={t('library.actions.delete')}
      />

      <LoadingOverlay visible={isAdding} message="Adding audiobook..." />
    </View>
  );
}

const createStyles = (colors: { background: string; textSecondary: string }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
      color: colors.textSecondary,
    },
  });
