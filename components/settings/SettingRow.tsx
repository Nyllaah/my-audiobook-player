import { DarkColors, LightColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode, useMemo } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

type SettingRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
} | {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  switchValue: boolean;
  onSwitchChange: (value: boolean) => void;
};

export function SettingRow(props: SettingRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isSwitch = 'switchValue' in props;

  if (isSwitch) {
    return (
      <View style={styles.row}>
        <View style={styles.left}>
          <Ionicons name={props.icon} size={24} color={colors.primaryOrange} />
          <Text style={styles.title}>{props.title}</Text>
        </View>
        <Switch
          value={props.switchValue}
          onValueChange={props.onSwitchChange}
          trackColor={{ false: colors.primaryVanilla, true: colors.primaryOrange }}
          thumbColor={colors.white}
        />
      </View>
    );
  }

  const { value, onPress, showChevron = true } = props;
  const content = (
    <>
      <View style={styles.left}>
        <Ionicons name={props.icon} size={24} color={colors.primaryOrange} />
        <Text style={styles.title}>{props.title}</Text>
      </View>
      {(value !== undefined || showChevron) && (
        <View style={styles.right}>
          {value !== undefined && (
            <Text style={styles.value}>{value}</Text>
          )}
          {showChevron && (
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          )}
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.row}>{content}</View>;
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.backgroundLight,
      padding: 16,
      marginBottom: 8,
      borderRadius: 12,
      maxHeight: 56,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    title: {
      fontSize: 16,
      color: colors.text,
    },
    right: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    value: {
      fontSize: 16,
      color: colors.textTertiary,
    },
  });
