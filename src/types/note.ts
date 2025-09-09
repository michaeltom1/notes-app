export interface Note {
  id: string;
  title: string;
  body: string;
  lastModified: number;
  favorited: boolean;
  trashed: boolean;
}