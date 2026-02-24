export interface AudiobookNote {
  id: string;
  audiobookId: string;
  positionSeconds: number;
  text: string;
  createdAt: number;
}
