import { useAudiobook } from '@/context/AudiobookContext';
import { storageService } from '@/services/storageService';
import { Audiobook } from '@/types/audiobook';
import { detectAudiobookTitle, sortAudioFiles } from '@/utils/audiobookParser';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Modal, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LibraryScreen() {
  const router = useRouter();
  const { audiobooks, isLoading, addAudiobook, removeAudiobook, playAudiobook, refreshLibrary } = useAudiobook();
  
  const [titleDialogVisible, setTitleDialogVisible] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [pendingAudiobook, setPendingAudiobook] = useState<{
    sortedParts: any[];
    detectedTitle: string;
  } | null>(null);

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

  const pickAudioFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (result.assets.length === 1) {
          const file = result.assets[0];
          const audiobook: Audiobook = {
            id: Date.now().toString(),
            title: file.name.replace(/\.[^/.]+$/, ''),
            uri: file.uri,
            addedDate: Date.now(),
            currentPosition: 0,
          };
          await addAudiobook(audiobook);
          Alert.alert('Success!', `Added "${audiobook.title}"`);
          return;
        }

        const files = result.assets.map(asset => ({
          name: asset.name,
          uri: asset.uri,
        }));

        const sortedParts = sortAudioFiles(files);
        
        const detectedTitle = detectAudiobookTitle(files);

        setPendingAudiobook({ sortedParts, detectedTitle });
        setEditableTitle(detectedTitle);
        setTitleDialogVisible(true);
      }
    } catch (error) {
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
                {item.parts.length} parts
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
          style={styles.deleteButton}
          onPress={() => handleDeleteBook(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
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
          <Text style={styles.emptyTitle}>No Audiobooks</Text>
          <Text style={styles.subtitle}>Add some audiobooks to get started</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 16,
    backgroundColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
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
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  author: {
    fontSize: 14,
    color: '#666',
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
  deleteButton: {
    padding: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
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
  titleInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#000',
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
});
