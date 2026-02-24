import type { AudiobookPart } from '@/types/audiobook';
import { DarkColors, LightColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type ChapterListModalProps = {
  visible: boolean;
  title: string;
  parts: AudiobookPart[];
  currentPartIndex: number;
  partNumberLabel: (number: number) => string;
  onSelectPart: (index: number) => void;
  onClose: () => void;
};

export function ChapterListModal({
  visible,
  title,
  parts,
  currentPartIndex,
  partNumberLabel,
  onSelectPart,
  onClose,
}: ChapterListModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list}>
            {parts.map((part, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.item,
                  currentPartIndex === index && styles.itemActive,
                ]}
                onPress={() => onSelectPart(index)}
              >
                <View style={styles.itemInfo}>
                  <Text style={styles.partNumber}>{partNumberLabel(index + 1)}</Text>
                  <Text style={styles.partName} numberOfLines={2}>
                    {part.filename}
                  </Text>
                </View>
                {currentPartIndex === index && (
                  <Ionicons name="checkmark" size={24} color={colors.primaryOrange} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modal: {
      backgroundColor: colors.backgroundLight,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '70%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
    list: {
      maxHeight: 400,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    itemActive: {
      backgroundColor: colors.background,
    },
    itemInfo: {
      flex: 1,
    },
    partNumber: {
      fontSize: 12,
      color: colors.primaryOrange,
      fontWeight: '600',
      marginBottom: 4,
    },
    partName: {
      fontSize: 14,
      color: colors.text,
    },
  });
