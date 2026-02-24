import { DarkColors, LightColors } from '@/constants/colors';
import { useAudiobook } from '@/context/AudiobookContext';
import { useTheme } from '@/context/ThemeContext';
import { formatTime } from '@/utils/timeFormatter';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function MiniPlayer() {
  const router = useRouter();
  const { colors } = useTheme();
  const { currentBook, playbackState, togglePlayPause } = useAudiobook();

  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!currentBook) return null;

  const progress = playbackState.duration > 0
    ? (playbackState.position / playbackState.duration) * 100
    : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push('/player')}
      activeOpacity={0.9}
    >
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {currentBook.artwork ? (
            <Image
              source={{ uri: currentBook.artwork }}
              style={styles.coverImage}
            />
          ) : (
            <Ionicons name="book" size={32} color={colors.primaryOrange} />
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentBook.title}
          </Text>
          <Text style={styles.time}>
            {formatTime(playbackState.position)} / {formatTime(playbackState.duration)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.playButton}
          onPress={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
        >
          <Ionicons
            name={playbackState.isPlaying ? 'pause' : 'play'}
            size={28}
            color={colors.primaryOrange}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: typeof LightColors | typeof DarkColors) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 65,
    left: 0,
    right: 0,
    backgroundColor: colors.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 1000,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primaryOrange,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  playButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
