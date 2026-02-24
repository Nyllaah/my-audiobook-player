import { DarkColors, LightColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type PlayerTrackInfoProps = {
  title: string;
  author?: string;
};

export function PlayerTrackInfo({ title, author }: PlayerTrackInfoProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      {author ? (
        <Text style={styles.author} numberOfLines={1}>
          {author}
        </Text>
      ) : null}
    </View>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    author: {
      fontSize: 16,
      color: colors.textTertiary,
      textAlign: 'center',
    },
  });
