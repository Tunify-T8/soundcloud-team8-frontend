export interface DiscoverTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  waveformUrl: string;
  durationSeconds: number;
  genre: string | null;
  createdAt: string;
}

export interface DiscoverResponse {
  items: DiscoverTrack[];
  page: number;
  limit: number;
  hasMore: boolean;
  personalized: boolean;
}
