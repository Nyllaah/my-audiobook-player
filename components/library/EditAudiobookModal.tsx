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

type EditAudiobookModalProps = {
  visible: boolean;
  editCoverUri: string | null;
  editTitle: string;
  editAuthor: string;
  onTitleChange: (text: string) => void;
  onAuthorChange: (text: string) => void;
  onPickCover: () => void;
  onRemoveCover: () => void;
  onSave: () => void;
  onCancel: () => void;
  scrollRef: React.RefObject<ScrollView | null>;
  contentRef: React.RefObject<View | null>;
  titleWrapperRef: React.RefObject<View | null>;
  authorWrapperRef: React.RefObject<View | null>;
  onTitleFocus: () => void;
  onAuthorFocus: () => void;
  labels: {
    title: string;
    pickCover: string;
    titleLabel: string;
    enterTitle: string;
    authorLabel: string;
    cancel: string;
    save: string;
  };
};

export function EditAudiobookModal({
  visible,
  editCoverUri,
  editTitle,
  editAuthor,
  onTitleChange,
  onAuthorChange,
  onPickCover,
  onRemoveCover,
  onSave,
  onCancel,
  scrollRef,
  contentRef,
  titleWrapperRef,
  authorWrapperRef,
  onTitleFocus,
  onAuthorFocus,
  labels,
}: EditAudiobookModalProps) {
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

              <Text style={styles.inputLabel}>{labels.pickCover}</Text>
              <View style={styles.coverSection}>
                {editCoverUri ? (
                  <View style={styles.coverPreview}>
                    <Image source={{ uri: editCoverUri }} style={styles.coverImage} />
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
              <View ref={titleWrapperRef}>
                <TextInput
                  style={styles.titleInput}
                  value={editTitle}
                  onChangeText={onTitleChange}
                  placeholder={labels.enterTitle}
                  autoCapitalize="words"
                  onFocus={onTitleFocus}
                />
              </View>

              <Text style={styles.inputLabel}>{labels.authorLabel}</Text>
              <View ref={authorWrapperRef}>
                <TextInput
                  style={styles.titleInput}
                  value={editAuthor}
                  onChangeText={onAuthorChange}
                  placeholder={labels.authorLabel}
                  autoCapitalize="words"
                  onFocus={onAuthorFocus}
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
                  onPress={onSave}
                >
                  <Text style={styles.confirmButtonText}>{labels.save}</Text>
                </TouchableOpacity>
              </View>
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
