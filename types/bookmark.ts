export interface AudiobookBookmark {
  id: string;
  audiobookId: string;
  positionSeconds: number;
  /** Optional label (e.g. "Chapter 5") */
  label?: string;
  createdAt: number;
}
