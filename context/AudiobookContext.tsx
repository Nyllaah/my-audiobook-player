import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Audiobook, PlaybackState } from '@/types/audiobook';
import { audioPlayerService, PlayerState } from '@/services/audioPlayerService';
import { storageService } from '@/services/storageService';

interface AudiobookContextType {
  audiobooks: Audiobook[];
  currentBook: Audiobook | null;
  playbackState: PlaybackState;
  isLoading: boolean;
  addAudiobook: (audiobook: Audiobook) => Promise<void>;
  removeAudiobook: (id: string) => Promise<void>;
  playAudiobook: (audiobook: Audiobook) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  skipForward: () => Promise<void>;
  skipBackward: () => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
  updateBookProgress: (id: string, position: number) => Promise<void>;
  refreshLibrary: () => Promise<void>;
}

const AudiobookContext = createContext<AudiobookContextType | undefined>(undefined);

export function AudiobookProvider({ children }: { children: React.ReactNode }) {
  const [audiobooks, setAudiobooks] = useState<Audiobook[]>([]);
  const [currentBook, setCurrentBook] = useState<Audiobook | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentBook: null,
    position: 0,
    duration: 0,
    playbackRate: 1.0,
  });

  // Initialize player and load audiobooks
  useEffect(() => {
    const init = async () => {
      await audioPlayerService.initialize();
      const books = await storageService.getAudiobooks();
      setAudiobooks(books);
      setIsLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update playback state periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      const state = await audioPlayerService.getState();
      const position = await audioPlayerService.getPosition();
      const duration = await audioPlayerService.getDuration();
      
      setPlaybackState((prev) => ({
        ...prev,
        isPlaying: state === PlayerState.Playing,
        position,
        duration,
        currentBook,
      }));
    }, 500); // Update every 500ms

    return () => clearInterval(interval);
  }, [currentBook]);

  // Save progress periodically
  useEffect(() => {
    if (currentBook && playbackState.position > 0) {
      const saveProgress = async () => {
        await storageService.updateAudiobook(currentBook.id, {
          currentPosition: playbackState.position,
        });
      };
      const interval = setInterval(saveProgress, 10000); // Save every 10 seconds
      return () => clearInterval(interval);
    }
  }, [currentBook, playbackState.position]);

  const refreshLibrary = useCallback(async () => {
    const books = await storageService.getAudiobooks();
    setAudiobooks(books);
  }, []);

  const addAudiobook = useCallback(async (audiobook: Audiobook) => {
    await storageService.addAudiobook(audiobook);
    await refreshLibrary();
  }, [refreshLibrary]);

  const removeAudiobook = useCallback(async (id: string) => {
    await storageService.deleteAudiobook(id);
    if (currentBook?.id === id) {
      await audioPlayerService.stop();
      setCurrentBook(null);
    }
    await refreshLibrary();
  }, [currentBook, refreshLibrary]);

  const playAudiobook = useCallback(async (audiobook: Audiobook) => {
    try {
      await audioPlayerService.loadAudiobook(audiobook);
      await audioPlayerService.play();
      setCurrentBook(audiobook);
      await storageService.updateAudiobook(audiobook.id, {
        lastPlayed: Date.now(),
      });
    } catch (error) {
      console.error('Failed to play audiobook:', error);
    }
  }, []);

  const togglePlayPause = useCallback(async () => {
    const state = await audioPlayerService.getState();
    if (state === PlayerState.Playing) {
      await audioPlayerService.pause();
    } else {
      await audioPlayerService.play();
    }
  }, []);

  const seekTo = useCallback(async (position: number) => {
    await audioPlayerService.seekTo(position);
  }, []);

  const skipForward = useCallback(async () => {
    await audioPlayerService.skipForward(30);
  }, []);

  const skipBackward = useCallback(async () => {
    await audioPlayerService.skipBackward(15);
  }, []);

  const setPlaybackRate = useCallback(async (rate: number) => {
    await audioPlayerService.setPlaybackRate(rate);
    setPlaybackState((prev) => ({ ...prev, playbackRate: rate }));
  }, []);

  const updateBookProgress = useCallback(async (id: string, position: number) => {
    await storageService.updateAudiobook(id, {
      currentPosition: position,
    });
    await refreshLibrary();
  }, [refreshLibrary]);

  return (
    <AudiobookContext.Provider
      value={{
        audiobooks,
        currentBook,
        playbackState,
        isLoading,
        addAudiobook,
        removeAudiobook,
        playAudiobook,
        togglePlayPause,
        seekTo,
        skipForward,
        skipBackward,
        setPlaybackRate,
        updateBookProgress,
        refreshLibrary,
      }}
    >
      {children}
    </AudiobookContext.Provider>
  );
}

export function useAudiobook() {
  const context = useContext(AudiobookContext);
  if (!context) {
    throw new Error('useAudiobook must be used within AudiobookProvider');
  }
  return context;
}
