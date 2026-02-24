import { TIMING } from '@/constants/timing';
import { audioPlayerService, PlayerState } from '@/services/audioPlayerService';
import { storageService } from '@/services/storageService';
import { Audiobook, PlaybackState } from '@/types/audiobook';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSettings } from '@/context/SettingsContext';

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
  const { skipForwardSeconds, skipBackwardSeconds } = useSettings();
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
      await audioPlayerService.applyNotificationOptions(skipForwardSeconds, skipBackwardSeconds);
      const books = await storageService.getAudiobooks();
      setAudiobooks(books);
      setIsLoading(false);
      // Sync notification artwork from storage so custom cover shows after app restart
      await audioPlayerService.syncCurrentTrackArtworkFromAudiobooks(books);
    };
    init();
  }, []);

  useEffect(() => {
    audioPlayerService.applyNotificationOptions(skipForwardSeconds, skipBackwardSeconds);
  }, [skipForwardSeconds, skipBackwardSeconds]);

  const currentBookRef = useRef(currentBook);
  currentBookRef.current = currentBook;

  useEffect(() => {
    const onProgressSave = (positionSeconds: number) => {
      const book = currentBookRef.current;
      if (!book || positionSeconds < 0) return;
      storageService.updateAudiobook(book.id, { currentPosition: positionSeconds });
      setCurrentBook((prev: Audiobook | null) => (prev ? { ...prev, currentPosition: positionSeconds } : null));
      setAudiobooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, currentPosition: positionSeconds } : b))
      );
    };
    audioPlayerService.setProgressSaveCallback(onProgressSave);
    return () => audioPlayerService.setProgressSaveCallback(null);
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      if (nextState === 'background') {
        const book = currentBookRef.current;
        if (!book) return;
        audioPlayerService.getPosition().then((position) => {
          if (position > 0) {
            storageService.updateAudiobook(book.id, {
              currentPosition: position,
              ...(book.parts?.length ? { currentPart: book.currentPart ?? 0 } : {}),
            });
            setAudiobooks((prev) =>
              prev.map((b) =>
                b.id === book.id
                  ? { ...b, currentPosition: position, currentPart: book.currentPart ?? b.currentPart }
                  : b
              )
            );
          }
        });
      } else if (nextState === 'active') {
        const books = await storageService.getAudiobooks();
        await audioPlayerService.syncCurrentTrackArtworkFromAudiobooks(books);
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const state = await audioPlayerService.getState();
      const position = await audioPlayerService.getPosition();
      const duration = await audioPlayerService.getDuration();
      const activePartIndex = await audioPlayerService.getActivePartIndex();
      setPlaybackState((prev) => ({
        ...prev,
        isPlaying: state === PlayerState.Playing,
        position,
        duration,
        currentBook,
      }));

      if (!currentBook) return;

      const partChanged =
        currentBook.parts &&
        currentBook.parts.length > 1 &&
        activePartIndex !== undefined &&
        activePartIndex !== currentBook.currentPart;
      const needsDuration = duration > 0 && (currentBook.duration == null || currentBook.duration === 0);

      if (partChanged) {
        setCurrentBook((prev: Audiobook | null) => (prev ? { ...prev, currentPart: activePartIndex } : null));
      }
      if (needsDuration) {
        await storageService.updateAudiobook(currentBook.id, { duration });
        setCurrentBook((prev: Audiobook | null) => (prev ? { ...prev, duration } : null));
      }
      if (partChanged || needsDuration) {
        setAudiobooks((prev) =>
          prev.map((b) =>
            b.id === currentBook.id
              ? {
                  ...b,
                  currentPosition: position,
                  ...(partChanged ? { currentPart: activePartIndex } : {}),
                  ...(needsDuration ? { duration } : {}),
                }
              : b
          )
        );
      }
    }, TIMING.PLAYBACK_STATE_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [currentBook]);
  const saveCurrentProgress = useCallback(async () => {
    if (!currentBook || playbackState.position <= 0) return;

    const updates: Partial<Audiobook> = {
      currentPosition: playbackState.position,
    };

    if (currentBook.parts && currentBook.parts.length > 1) {
      updates.currentPart = currentBook.currentPart ?? 0;
    }

    await storageService.updateAudiobook(currentBook.id, updates);
    setAudiobooks((prev) =>
      prev.map((b) =>
        b.id === currentBook.id
          ? { ...b, currentPosition: playbackState.position, currentPart: updates.currentPart ?? b.currentPart }
          : b
      )
    );
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

      const storedPosition = bookToPlay.currentPosition ?? 0;
      const storedDuration = bookToPlay.duration ?? 0;
      setPlaybackState((prev) => ({
        ...prev,
        position: storedPosition,
        duration: storedDuration > 0 ? storedDuration : prev.duration,
        currentBook: bookToPlay,
      }));

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
    await audioPlayerService.skipForward(skipForwardSeconds);
  }, [skipForwardSeconds]);

  const skipBackward = useCallback(async () => {
    await audioPlayerService.skipBackward(skipBackwardSeconds);
  }, [skipBackwardSeconds]);

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
