import { useAudiobook } from '@/context/AudiobookContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

export default function MiniPlayer() {
  const router = useRouter();
  const { colors } = useTheme();
  const { currentBook, playbackState, togglePlayPause } = useAudiobook();
  
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!currentBook) return null;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

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
            <Ionicons name="book" size={32} color="#007AFF" />
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
            color="#007AFF"
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 65,
    left: 0,
    right: 0,
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
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
    backgroundColor: colors.primary,
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
