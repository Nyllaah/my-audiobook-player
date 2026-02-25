import { DarkColors, LightColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import { formatTime } from '@/utils/timeFormatter';
import React, { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
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
  addLabel: string;
  cancelLabel: string;
  placeholder?: string;
  viewBookmarksLabel?: string;
  onAdd: (label?: string) => void;
  onClose: () => void;
  onViewBookmarks?: () => void;
};

export function AddBookmarkModal({
  visible,
  positionSeconds,
  addLabel,
  cancelLabel,
  placeholder = 'Optional label...',
  viewBookmarksLabel,
  onAdd,
  onClose,
  onViewBookmarks,
}: AddBookmarkModalProps) {
  const { colors } = useTheme();
  const [label, setLabel] = useState('');
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleAdd = () => {
    onAdd(label.trim() || undefined);
    setLabel('');
    onClose();
  };

  const handleClose = () => {
    setLabel('');
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
            value={label}
            onChangeText={setLabel}
            placeholder={placeholder}
            placeholderTextColor={colors.placeholder}
            maxLength={100}
          />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.addText}>{addLabel}</Text>
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
    addButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: colors.primaryOrange,
    },
    addText: {
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
