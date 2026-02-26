import { DarkColors, LightColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import { formatTime } from '@/utils/timeFormatter';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type AddBookmarkModalProps = {
  visible: boolean;
  positionSeconds: number;
  saveLabel: string;
  cancelLabel: string;
  placeholder?: string;
  viewBookmarksLabel?: string;
  onSave: (text: string) => void;
  onClose: () => void;
  onViewBookmarks?: () => void;
};

export function AddBookmarkModal({
  visible,
  positionSeconds,
  saveLabel,
  cancelLabel,
  placeholder = 'Optional label...',
  viewBookmarksLabel,
  onSave,
  onClose,
  onViewBookmarks,
}: AddBookmarkModalProps) {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleSave = () => {
    const trimmed = text.trim();
    if (trimmed) {
      onSave(trimmed);
      setText('');
    }
    onClose();
  };

  const handleClose = () => {
    setText('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior="padding"
        keyboardVerticalOffset={24}
      >
        <View style={styles.dialog}>
          <Text style={styles.positionLabel}>{formatTime(positionSeconds)}</Text>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor={colors.placeholder}
            multiline
            autoFocus
            maxLength={2000}
          />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, !text.trim() && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!text.trim()}
            >
              <Text style={styles.saveText}>{saveLabel}</Text>
            </TouchableOpacity>
          </View>
          {viewBookmarksLabel && onViewBookmarks ? (
            <TouchableOpacity style={styles.viewLink} onPress={onViewBookmarks}>
              <Text style={styles.viewLinkText}>{viewBookmarksLabel}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.primaryOrange} />
            </TouchableOpacity>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dialog: {
      backgroundColor: colors.backgroundLight,
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxWidth: 360,
    },
    positionLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      minHeight: 120,
      textAlignVertical: 'top',
      marginBottom: 20,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'flex-end',
    },
    cancelButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    cancelText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    saveButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: colors.primaryOrange,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '600',
    },
    viewLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      marginTop: 16,
      paddingVertical: 8,
    },
    viewLinkText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.primaryOrange,
    },
  });
