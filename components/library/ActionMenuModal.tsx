import { DarkColors, LightColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type ActionMenuModalProps = {
  visible: boolean;
  position: { x: number; y: number };
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  editLabel: string;
  deleteLabel: string;
};

export function ActionMenuModal({
  visible,
  position,
  onEdit,
  onDelete,
  onClose,
  editLabel,
  deleteLabel,
}: ActionMenuModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.container,
            { top: position.y - 50, left: position.x - 150 },
          ]}
        >
          <TouchableOpacity style={styles.item} onPress={onEdit}>
            <Ionicons name="create-outline" size={22} color={colors.primaryOrange} />
            <Text style={styles.itemText}>{editLabel}</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.item} onPress={onDelete}>
            <Ionicons name="trash-outline" size={22} color={colors.primaryOrange} />
            <Text style={[styles.itemText, { color: colors.red }]}>{deleteLabel}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
    container: {
      position: 'absolute',
      backgroundColor: colors.backgroundLight,
      borderRadius: 12,
      overflow: 'hidden',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 12,
    },
    itemText: {
      fontSize: 16,
      color: colors.text,
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
    },
  });
