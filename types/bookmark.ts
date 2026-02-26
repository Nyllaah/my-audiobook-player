export interface AudiobookBookmark {
  id: string;
  audiobookId: string;
  positionSeconds: number;
  /** Optional label or note at this position */
  text: string;
  createdAt: number;
}
