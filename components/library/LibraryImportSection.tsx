import type { PendingAudiobook } from './ImportTitleModal';
import { ImportTitleModal } from './ImportTitleModal';
import { LibraryHeader } from './LibraryHeader';
import { LoadingOverlay } from './LoadingOverlay';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { useAudiobook } from '@/context/AudiobookContext';
import { useLanguage } from '@/context/LanguageContext';
import { Audiobook } from '@/types/audiobook';
import { getArtworkUriFromAudioFile } from '@/utils/audioMetadata';
import { detectAudiobookTitle, sortAudioFiles } from '@/utils/audiobookParser';
import { isImageFile } from '@/utils/fileUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, findNodeHandle, ScrollView, View } from 'react-native';

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

export function LibraryImportSection() {
  const { t } = useLanguage();
  const { addAudiobook } = useAudiobook();

  const [titleDialogVisible, setTitleDialogVisible] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [pendingCoverUri, setPendingCoverUri] = useState<string | null>(null);
  const [pendingAudiobook, setPendingAudiobook] =
    useState<PendingAudiobook | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const titleModalScrollRef = useRef<ScrollView>(null);
  const titleModalContentRef = useRef<View>(null);
  const titleInputWrapperRef = useRef<View>(null);

  const hasSeenImportInfo = useCallback(async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.IMPORT_INFO_SEEN);
      return value === 'true';
    } catch (error) {
      console.error('Failed to check import info status:', error);
      return false;
    }
  }, []);

  const markImportInfoAsSeen = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IMPORT_INFO_SEEN, 'true');
    } catch (error) {
      console.error('Failed to mark import info as seen:', error);
    }
  }, []);

  const showImportInfoDialog = useCallback(
    (onContinue: () => void): void => {
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
    },
    [t, markImportInfoAsSeen]
  );

  const handleConfirmTitle = useCallback(async () => {
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
    Alert.alert(
      'Success!',
      `Added "${finalTitle}" with ${pendingAudiobook.sortedParts.length} parts`
    );
  }, [addAudiobook, editableTitle, pendingAudiobook, pendingCoverUri]);

  const handleCancelTitle = useCallback(() => {
    setTitleDialogVisible(false);
    setPendingAudiobook(null);
    setPendingCoverUri(null);
  }, []);

  const handlePickPendingCover = useCallback(async () => {
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
      setPendingCoverUri(result.assets[0].uri);
    }
  }, []);

  const handleRemovePendingCover = useCallback(() => setPendingCoverUri(null), []);

  const doPickAudioFiles = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled) return;

      if (result.assets && result.assets.length > 0) {
        setIsAdding(true);

        const allFiles = result.assets.map((asset) => ({
          name: asset.name,
          uri: asset.uri,
        }));
        const audioFiles = allFiles.filter((file) => !isImageFile(file.name));
        const imageFiles = allFiles.filter((file) => isImageFile(file.name));
        const autoCoverUri =
          imageFiles.length > 0 ? imageFiles[0].uri : null;

        if (audioFiles.length === 0) {
          setIsAdding(false);
          Alert.alert(
            'Error',
            'No audio files selected. Please select at least one audio file.'
          );
          return;
        }

        if (audioFiles.length === 1) {
          const file = audioFiles[0];
          let coverUri = autoCoverUri;
          if (!coverUri) {
            try {
              coverUri =
                (await getArtworkUriFromAudioFile(file.uri)) ?? null;
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
        message.includes('FileNotFoundException') ||
          message.includes('Cello error')
          ? 'Could not read the selected file(s). Try choosing the file again or a different folder.'
          : 'Failed to add audiobook. Please try again.'
      );
    }
  }, [addAudiobook]);

  const pickAudioFiles = useCallback(async () => {
    const hasSeen = await hasSeenImportInfo();
    if (!hasSeen) {
      showImportInfoDialog(() => doPickAudioFiles());
    } else {
      doPickAudioFiles();
    }
  }, [hasSeenImportInfo, showImportInfoDialog, doPickAudioFiles]);

  return (
    <>
      <LibraryHeader onAddPress={pickAudioFiles} />

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
            ? t('modals.filesSelected', {
                count: pendingAudiobook.sortedParts.length,
              })
            : '',
          andMore:
            pendingAudiobook && pendingAudiobook.sortedParts.length > 3
              ? t('modals.andMore', {
                  count: pendingAudiobook.sortedParts.length - 3,
                })
              : '',
          pickCover: t('modals.pickCover'),
          titleLabel: t('modals.title'),
          enterTitle: t('modals.enterTitle'),
          cancel: t('modals.cancel'),
          add: t('modals.add'),
        }}
      />

      <LoadingOverlay visible={isAdding} message="Adding audiobook..." />
    </>
  );
}
