import { audioPlayerService, PlayerState } from '@/services/audioPlayerService';
import { storageService } from '@/services/storageService';
import { Audiobook, PlaybackState } from '@/types/audiobook';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

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
  saveCurrentProgress: () => Promise<void>;
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

  useEffect(() => {
    const init = async () => {
      await audioPlayerService.initialize();
      const books = await storageService.getAudiobooks();
      setAudiobooks(books);
      setIsLoading(false);
    };
    init();
     
  }, []);

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
    }, 500); 

    return () => clearInterval(interval);
  }, [currentBook]);
  // Save progress function
  const saveCurrentProgress = useCallback(async () => {
    console.log('saveCurrentProgress called', {
      hasCurrentBook: !!currentBook,
      position: playbackState.position,
      bookId: currentBook?.id,
      bookTitle: currentBook?.title,
    });
    
    if (!currentBook || playbackState.position <= 0) {
      console.log('Skipping save - no book or position <= 0');
      return;
    }
    
    const updates: Partial<Audiobook> = {
      currentPosition: playbackState.position,
    };
    
    // Save current part for multi-part audiobooks
    if (currentBook.parts && currentBook.parts.length > 1) {
      updates.currentPart = currentBook.currentPart || 0;
      console.log('Saving multi-part progress:', updates);
    }
    
    console.log('Saving progress:', currentBook.id, updates);
    await storageService.updateAudiobook(currentBook.id, updates);
    console.log('Progress saved successfully');
  }, [currentBook, playbackState.position]);

  // Auto-save progress every 10 seconds
  useEffect(() => {
    if (currentBook && playbackState.position > 0) {
      const interval = setInterval(saveCurrentProgress, 10000); 
      return () => {
        clearInterval(interval);
        // Save one last time when unmounting
        saveCurrentProgress();
      };
    }
  }, [currentBook, playbackState.position, saveCurrentProgress]);

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
      // For multi-part audiobooks, ensure we're using the correct part URI
      let bookToPlay = { ...audiobook };
      if (audiobook.parts && audiobook.parts.length > 1) {
        const partIndex = audiobook.currentPart || 0;
        bookToPlay.uri = audiobook.parts[partIndex].uri;
      }
      
      await audioPlayerService.loadAudiobook(bookToPlay);
      await audioPlayerService.play();
      setCurrentBook(bookToPlay);
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
      // Save progress when pausing
      await saveCurrentProgress();
    } else {
      await audioPlayerService.play();
    }
  }, [saveCurrentProgress]);

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
        saveCurrentProgress,
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
