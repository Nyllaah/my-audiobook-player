import { DarkColors, LightColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';

type PlayerArtworkProps = {
  artworkUri?: string | null;
};

export function PlayerArtwork({ artworkUri }: PlayerArtworkProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.artwork}>
        {artworkUri ? (
          <Image
            source={{ uri: artworkUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="book" size={120} color={colors.primaryOrange} />
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 40,
    },
    artwork: {
      width: 280,
      height: 280,
      borderRadius: 20,
      backgroundColor: colors.backgroundLight,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 10,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
  });
