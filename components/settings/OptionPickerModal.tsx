import { DarkColors, LightColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import React, { useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export type OptionItem<T = string | number> = {
  value: T;
  label: string;
};

type OptionPickerModalProps<T = string | number> = {
  visible: boolean;
  title: string;
  options: OptionItem<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  onClose: () => void;
};

export function OptionPickerModal<T = string | number>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: OptionPickerModalProps<T>) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.options}>
            {options.map((opt) => (
              <TouchableOpacity
                key={String(opt.value)}
                style={[
                  styles.optionButton,
                  selectedValue === opt.value && styles.optionButtonActive,
                ]}
                onPress={() => {
                  onSelect(opt.value);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedValue === opt.value && styles.optionTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      backgroundColor: colors.backgroundLight,
      borderRadius: 16,
      padding: 24,
      width: '85%',
      maxWidth: 400,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    options: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    optionButton: {
      minWidth: '30%',
      backgroundColor: colors.background,
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    optionButtonActive: {
      backgroundColor: colors.primaryOrange,
      borderColor: colors.primaryOrange,
    },
    optionText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    optionTextActive: {
      color: colors.white,
    },
  });
