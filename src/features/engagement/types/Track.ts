export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  duration: number;
  genre: string;
  artworkUrl: string;
  audioUrl: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  plays: number;
  likes: number;
  reposts: number;
}