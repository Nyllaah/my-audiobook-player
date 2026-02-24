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

const TIMER_OPTIONS = [5, 10, 15, 30, 45, 60];

type SleepTimerModalProps = {
  visible: boolean;
  title: string;
  subtitle: string;
  cancelLabel: string;
  onSelectMinutes: (minutes: number) => void;
  onClose: () => void;
};

export function SleepTimerModal({
  visible,
  title,
  subtitle,
  cancelLabel,
  onSelectMinutes,
  onClose,
}: SleepTimerModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.options}>
            {TIMER_OPTIONS.map((minutes) => (
              <TouchableOpacity
                key={minutes}
                style={styles.option}
                onPress={() => onSelectMinutes(minutes)}
              >
                <Text style={styles.optionText}>{minutes} min</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </TouchableOpacity>
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
      justifyContent: 'center',
      alignItems: 'center',
    },
    dialog: {
      backgroundColor: colors.backgroundLight,
      borderRadius: 16,
      padding: 24,
      width: '80%',
      maxWidth: 320,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 20,
      textAlign: 'center',
    },
    options: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 20,
    },
    option: {
      minWidth: '30%',
      backgroundColor: colors.background,
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    optionText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primaryOrange,
    },
    cancelButton: {
      backgroundColor: colors.background,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
  });
