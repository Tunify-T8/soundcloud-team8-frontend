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

export enum ReasonType {
  FOLLOW = "FOLLOW",
  TASTE = "TASTE",
  GENRE = "GENRE",
  TRENDING = "TRENDING",
  TAG = "TAG",
}

export interface RecommendationItemDto {
  trackId: string;
  artistId: string;
  artistAvatarUrl: string | null;
  artistIsCertified: boolean;
  title: string;
  artist: string;
  genre: string | null;
  durationInSeconds: number;
  coverUrl: string | null;
  waveformUrl: string | null;
  numberOfComments: number;
  numberOfLikes: number;
  numberOfReposts: number;
  numberOfListens: number;
  isLiked: boolean;
  isReposted: boolean;
  reason: string;
  reasonType: ReasonType;
}

export interface RecommendationsResponseDto {
  data: RecommendationItemDto[];
  page: number;
  limit: number;
  hasMore: boolean;
  meta?: { code: "NO_DATA"; message: string };
}
