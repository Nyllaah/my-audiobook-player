import { TIMING } from '@/constants/timing';
import { useSettings } from '@/context/SettingsContext';
import { audioPlayerService, PlayerState } from '@/services/audioPlayerService';
import { storageService } from '@/services/storageService';
import { Audiobook, PlaybackState } from '@/types/audiobook';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import TrackPlayer, { Event, State } from 'react-native-track-player';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('TrackPlayer timeout')), ms)
    ),
  ]);
}

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

type AudiobookProviderProps = {
  children: React.ReactNode;
  onNotificationCleared?: () => void;
};

export function AudiobookProvider({ children, onNotificationCleared }: AudiobookProviderProps) {
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

  const lastSeekRef = useRef<{ position: number; at: number } | null>(null);

  useEffect(() => {
    const init = async () => {
      await audioPlayerService.initialize();
      await audioPlayerService.applyNotificationOptions(skipForwardSeconds, skipBackwardSeconds);
      const books = await storageService.getAudiobooks();
      setAudiobooks(books);
      setIsLoading(false);
      await audioPlayerService.syncCurrentTrackArtworkFromAudiobooks(books);

      try {
        const track = await TrackPlayer.getActiveTrack();
        if (track?.id) {
          const book = books.find(
            (b) =>
              b.id === track.id ||
              (typeof track.id === 'string' && track.id.startsWith(`${b.id}-`))
          );
          if (book) {
            setCurrentBook(book);
            const progress = await TrackPlayer.getProgress();
            setPlaybackState((prev) => ({
              ...prev,
              currentBook: book,
              position: progress.position,
              duration: progress.duration,
            }));
          }
        }
      } catch {
        // Ignore errors when there is no active track or service is unbound.
      }
    };
    init();
  }, []);

  useEffect(() => {
    audioPlayerService.applyNotificationOptions(skipForwardSeconds, skipBackwardSeconds);
  }, [skipForwardSeconds, skipBackwardSeconds]);

  const currentBookRef = useRef(currentBook);
  currentBookRef.current = currentBook;
  const onNotificationClearedRef = useRef(onNotificationCleared);
  onNotificationClearedRef.current = onNotificationCleared;

  const goBackToLibrary = useCallback(() => {
    setCurrentBook(null);
    setPlaybackState({
      isPlaying: false,
      currentBook: null,
      position: 0,
      duration: 0,
      playbackRate: 1.0,
    });
    onNotificationClearedRef.current?.();
  }, []);

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
        const book = currentBookRef.current;
        if (book) {
          setTimeout(async () => {
            try {
              const state = await withTimeout(
                audioPlayerService.getState(),
                TIMING.TRACK_PLAYER_CALL_TIMEOUT
              );
              if (state === PlayerState.None) {
                goBackToLibrary();
              }
            } catch {
              goBackToLibrary();
            }
          }, 400);
        }
      }
    });
    return () => subscription.remove();
  }, [goBackToLibrary]);

  useEffect(() => {
    const sub = TrackPlayer.addEventListener(Event.PlaybackState, (payload: { state: State }) => {
      if (payload.state === State.None || payload.state === State.Stopped) {
        setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
        if (currentBookRef.current) {
          goBackToLibrary();
        }
      }
    });
    return () => sub.remove();
  }, [goBackToLibrary]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const timeoutMs = TIMING.TRACK_PLAYER_CALL_TIMEOUT;
        const [state, rawPosition, duration, activePartIndex] = await withTimeout(
          Promise.all([
            audioPlayerService.getState(),
            audioPlayerService.getPosition(),
            audioPlayerService.getDuration(),
            audioPlayerService.getActivePartIndex(),
          ]),
          timeoutMs
        );

        const now = Date.now();
        const lastSeek = lastSeekRef.current;
        const position =
          lastSeek && now - lastSeek.at < 800
            ? lastSeek.position
            : rawPosition;
        if (lastSeek && now - lastSeek.at >= 800) {
          lastSeekRef.current = null;
        }

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
      } catch (err) {
        setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
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
      audioPlayerService.updateNowPlayingMetadataFromAudiobook(bookToPlay);

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
    try {
      const state = await withTimeout(
        audioPlayerService.getState(),
        TIMING.TRACK_PLAYER_CALL_TIMEOUT
      );
      if (state === PlayerState.Playing) {
        await audioPlayerService.pause();
        await saveCurrentProgress();
      } else {
        if (state === PlayerState.None && currentBook) {
          await playAudiobook(currentBook);
        } else {
          await audioPlayerService.play();
        }
      }
    } catch {
      if (currentBook) {
        await playAudiobook(currentBook);
      }
    }
  }, [saveCurrentProgress, currentBook, playAudiobook]);

  const seekTo = useCallback(async (position: number) => {
    lastSeekRef.current = { position, at: Date.now() };
    await audioPlayerService.seekTo(position);
    setPlaybackState((prev) => ({ ...prev, position }));
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
