import { useAudiobook } from '@/context/AudiobookContext';
import { useLanguage } from '@/context/LanguageContext';
import { audioPlayerService } from '@/services/audioPlayerService';
import { storageService } from '@/services/storageService';
import { Audiobook } from '@/types/audiobook';
import { copyCoverToAppStorage, deleteStoredCover } from '@/utils/coverStorage';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, findNodeHandle, FlatList, ScrollView, View } from 'react-native';
import { ActionMenuModal } from './ActionMenuModal';
import { AudiobookListItem } from './AudiobookListItem';
import { EditAudiobookModal } from './EditAudiobookModal';

function scrollFocusedInputIntoView(
  scrollRef: React.RefObject<ScrollView | null>,
  contentRef: React.RefObject<View | null>,
  inputWrapperRef: React.RefObject<View | null>,
  paddingFromTop = 80
) {
  const run = () => {
    if (!scrollRef.current || !contentRef.current || !inputWrapperRef.current)
      return;
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
}

export function LibraryListSection() {
  const { t } = useLanguage();
  const {
    audiobooks,
    removeAudiobook,
    refreshLibrary,
    currentBook,
    setCurrentBook,
  } = useAudiobook();

  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<Audiobook | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editCoverUri, setEditCoverUri] = useState<string | null>(null);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Audiobook | null>(null);
  const menuPositionRef = useRef({ x: 0, y: 0 });

  const editModalScrollRef = useRef<ScrollView>(null);
  const editModalContentRef = useRef<View>(null);
  const editTitleWrapperRef = useRef<View>(null);
  const editAuthorWrapperRef = useRef<View>(null);

  const handleEditBook = useCallback((book: Audiobook) => {
    setEditingBook(book);
    setEditTitle(book.title || '');
    setEditAuthor(book.author || '');
    setEditCoverUri(book.artwork || null);
    setEditDialogVisible(true);
  }, []);

  const handlePickCover = useCallback(async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        'Permission Required',
        'Permission to access photos is required!'
      );
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
  }, []);

  const handleRemoveCover = useCallback(() => setEditCoverUri(null), []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingBook) return;

    let artworkToSave: string | undefined;
    if (editCoverUri) {
      const permanentUri = await copyCoverToAppStorage(
        editCoverUri,
        editingBook.id
      );
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
  }, [
    editingBook,
    editCoverUri,
    editTitle,
    editAuthor,
    currentBook,
    refreshLibrary,
    setCurrentBook,
  ]);

  const handleCancelEdit = useCallback(() => {
    setEditDialogVisible(false);
    setEditingBook(null);
    setEditTitle('');
    setEditAuthor('');
    setEditCoverUri(null);
  }, []);

  const handleShowMenu = useCallback(
    (book: Audiobook, position: { x: number; y: number }) => {
      menuPositionRef.current = position;
      setSelectedBook(book);
      setActionMenuVisible(true);
    },
    []
  );

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

  return (
    <>
      <FlatList
        data={audiobooks}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
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
    </>
  );
}
