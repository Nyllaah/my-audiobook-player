export interface Audiobook {
  id: string;
  title: string;
  author?: string;
  uri: string;
  duration?: number;
  artwork?: string;
  currentPosition?: number;
  lastPlayed?: number;
  isFinished?: boolean;
  addedDate: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentBook: Audiobook | null;
  position: number;
  duration: number;
  playbackRate: number;
}
