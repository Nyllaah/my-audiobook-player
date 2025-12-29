import { TIMING } from '@/constants/timing';
import { audioPlayerService, PlayerState } from '@/services/audioPlayerService';
import { storageService } from '@/services/storageService';
import { Audiobook, PlaybackState } from '@/types/audiobook';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface AudiobookContextType {
  audiobooks: Audiobook[];
  currentBook: Audiobook | null;
  setCurrentBook: (book: Audiobook | null) => void;
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
    }, TIMING.PLAYBACK_STATE_UPDATE_INTERVAL); 

    return () => clearInterval(interval);
  }, [currentBook]);
  const saveCurrentProgress = useCallback(async () => {
    if (!currentBook || playbackState.position <= 0) return;
    
    const updates: Partial<Audiobook> = {
      currentPosition: playbackState.position,
    };
    
    if (currentBook.parts && currentBook.parts.length > 1) {
      updates.currentPart = currentBook.currentPart || 0;
    }
    
    await storageService.updateAudiobook(currentBook.id, updates);
  }, [currentBook, playbackState.position]);

  useEffect(() => {
    if (currentBook && playbackState.position > 0) {
      const interval = setInterval(saveCurrentProgress, TIMING.AUTO_SAVE_INTERVAL); 
      return () => {
        clearInterval(interval);
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
    const books = await storageService.getAudiobooks();
    setAudiobooks(books);
  }, []);

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
    if (currentBook?.id === id) {
      const books = await storageService.getAudiobooks();
      const updatedBook = books.find(b => b.id === id);
      if (updatedBook) {
        setCurrentBook(updatedBook);
      }
    }
  }, [refreshLibrary, currentBook]);

  return (
    <AudiobookContext.Provider
      value={{
        audiobooks,
        currentBook,
        setCurrentBook,
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
