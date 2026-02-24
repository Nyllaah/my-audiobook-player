import { DarkColors, LightColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AudiobookPart } from '@/types/audiobook';

export type PendingAudiobook = {
  sortedParts: AudiobookPart[];
  detectedTitle: string;
};

type ImportTitleModalProps = {
  visible: boolean;
  pendingAudiobook: PendingAudiobook | null;
  pendingCoverUri: string | null;
  editableTitle: string;
  onTitleChange: (text: string) => void;
  onPickCover: () => void;
  onRemoveCover: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  scrollRef: React.RefObject<ScrollView | null>;
  contentRef: React.RefObject<View | null>;
  titleInputWrapperRef: React.RefObject<View | null>;
  onTitleFocus: () => void;
  labels: {
    title: string;
    filesSelected: string;
    andMore: string;
    pickCover: string;
    titleLabel: string;
    enterTitle: string;
    cancel: string;
    add: string;
  };
};

export function ImportTitleModal({
  visible,
  pendingAudiobook,
  pendingCoverUri,
  editableTitle,
  onTitleChange,
  onPickCover,
  onRemoveCover,
  onConfirm,
  onCancel,
  scrollRef,
  contentRef,
  titleInputWrapperRef,
  onTitleFocus,
  labels,
}: ImportTitleModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View ref={contentRef} style={styles.modalContent}>
              <Text style={styles.modalTitle}>{labels.title}</Text>

              {pendingAudiobook && (
                <>
                  <Text style={styles.modalSubtitle}>
                    {labels.filesSelected}
                  </Text>

                  <View style={styles.filePreview}>
                    {pendingAudiobook.sortedParts.slice(0, 3).map((part, i) => (
                      <Text key={i} style={styles.fileName}>
                        {i + 1}. {part.filename}
                      </Text>
                    ))}
                    {pendingAudiobook.sortedParts.length > 3 && (
                      <Text style={styles.fileName}>{labels.andMore}</Text>
                    )}
                  </View>

                  <Text style={styles.inputLabel}>{labels.pickCover}</Text>
                  <View style={styles.coverSection}>
                    {pendingCoverUri ? (
                      <View style={styles.coverPreview}>
                        <Image source={{ uri: pendingCoverUri }} style={styles.coverImage} />
                        <TouchableOpacity
                          style={styles.removeCoverButton}
                          onPress={onRemoveCover}
                        >
                          <Ionicons name="close-circle" size={24} color={colors.primaryOrange} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.noCover}>
                        <Ionicons name="image-outline" size={48} color={colors.textTertiary} />
                        <Text style={styles.noCoverText}>{labels.pickCover}</Text>
                      </View>
                    )}
                    <TouchableOpacity style={styles.pickCoverButton} onPress={onPickCover}>
                      <Ionicons name="images-outline" size={20} color={colors.primaryOrange} />
                      <Text style={styles.pickCoverText}>{labels.pickCover}</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.inputLabel}>{labels.titleLabel}</Text>
                  <View ref={titleInputWrapperRef}>
                    <TextInput
                      style={styles.titleInput}
                      value={editableTitle}
                      onChangeText={onTitleChange}
                      placeholder={labels.enterTitle}
                      autoFocus
                      selectTextOnFocus
                      onFocus={onTitleFocus}
                    />
                  </View>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={onCancel}
                    >
                      <Text style={styles.cancelButtonText}>{labels.cancel}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.confirmButton]}
                      onPress={onConfirm}
                    >
                      <Text style={styles.confirmButtonText}>{labels.add}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    keyboardAvoid: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalScrollContent: {
      flexGrow: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 24,
    },
    modalContent: {
      backgroundColor: colors.backgroundLight,
      borderRadius: 12,
      padding: 24,
      maxWidth: 520,
      minWidth: '80%',
      alignSelf: 'center',
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
  });
