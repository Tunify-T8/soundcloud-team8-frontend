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

export interface DiscoverArtist {
  id: string;
  name: string;
  avatarUrl: string;
  followersCount: number;
  isVerified: boolean;
}

export interface DiscoverArtistsResponse {
  items: DiscoverArtist[];
  page: number;
  limit: number;
  hasMore: boolean;
}

export type TrendingType = "track" | "album" | "playlist";
export type TrendingPeriod = "month" | "week" | "day";

export interface TrendingItem {
  id: string;
  name: string;
  artist: string;
  coverUrl: string;
  type: TrendingType;
  score: number;
}

export interface TrendingResponse {
  items: TrendingItem[];
  type: TrendingType;
  period: TrendingPeriod;
}
