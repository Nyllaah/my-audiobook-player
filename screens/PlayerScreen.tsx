import {
  PlayerArtwork,
  PlayerEmptyState,
  PlayerPlaybackControls,
  PlayerProgress,
  PlayerChapterSection,
  PlayerSecondaryControls,
  PlayerTrackInfo,
} from '@/components/player';
import { DarkColors, LightColors } from '@/constants/colors';
import { useAudiobook } from '@/context/AudiobookContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function PlayerScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { currentBook, saveCurrentProgress } = useAudiobook();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleClose = useCallback(async () => {
    await saveCurrentProgress();
    if (router.canGoBack?.()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [saveCurrentProgress, router]);

  const goToLibrary = useCallback(() => {
    if (router.canGoBack?.()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [router]);

  if (!currentBook) {
    return (
      <View style={styles.container}>
        <PlayerEmptyState onGoToLibrary={goToLibrary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="chevron-back" size={32} color={colors.primaryOrange} />
      </TouchableOpacity>

      <View style={styles.content}>
        <PlayerArtwork artworkUri={currentBook.artwork} />
        <PlayerTrackInfo title={currentBook.title} author={currentBook.author} />

        <PlayerChapterSection />

        <PlayerProgress />

        <PlayerPlaybackControls />

        <PlayerSecondaryControls />
      </View>
    </View>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 36,
      paddingBottom: 24,
    },
    closeButton: {
      paddingHorizontal: 16,
      alignSelf: 'flex-start',
      marginBottom: 8,
    },
    content: {
      flex: 1,
      justifyContent: 'space-between',
      paddingHorizontal: 16,
    },
  });
