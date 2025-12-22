export interface AudiobookPart {
  uri: string;
  filename: string;
  duration?: number;
  partNumber?: number;
}

export interface Audiobook {
  id: string;
  title: string;
  author?: string;
  uri: string; // For single-file audiobooks, or first part for multi-part
  parts?: AudiobookPart[]; // For multi-part audiobooks
  duration?: number; // Total duration across all parts
  artwork?: string;
  currentPosition?: number; // Position in seconds across all parts
  currentPart?: number; // Index of the current part being played
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
