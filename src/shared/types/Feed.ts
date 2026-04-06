import { Genre } from "@/shared/types/Genre";

// Feed item action type
export interface FeedAction {
  id: string;
  username: string;
  action: "post" | "repost";
  avatarUrl: string | null;
  date: string;
}

// Feed item type
export interface FeedItem {
  trackId: string;
  artistId: string;
  artistAvatarUrl: string;
  artistIsCertified: boolean;
  action: FeedAction;
  title: string;
  artist: string;
  genre?: Genre | string;
  durationInSeconds: number;
  coverUrl: string | null;
  waveformUrl: string | null;
  numberOfComments: number;
  numberOfLikes: number;
  numberOfListens: number;
  numberOfReposts: number;
  isLiked: boolean;
  isReposted: boolean;
}

// Feed response type
export interface FeedResponse {
  items: FeedItem[];
  page: number;
  limit: number;
  hasMore: boolean;
}
// ─── Search ───────────────────────────────────────────────────────────────────

export interface TrackSearchResult {
  id: string;
  type: "track";
  title: string;
  artist: string;
  genre: string | null;
  durationSeconds: number;
  coverUrl: string | null;
  likesCount: number;
  playsCount: number;
  allowDownloads: boolean;
  createdAt: string;
  score: number;
}

export interface UserSearchResult {
  id: string;
  type: "user";
  username: string;
  displayName: string | null;
  bio: string | null;
  location: string | null;
  isCertified: boolean;
  followersCount: number;
  score: number;
}

export interface CollectionSearchResult {
  id: string;
  type: "album" | "playlist";
  title: string;
  artist: string;
  description: string | null;
  coverUrl: string | null;
  createdAt: string;
  score: number;
}

export type SearchResult =
  | TrackSearchResult
  | UserSearchResult
  | CollectionSearchResult;

export type FilterType =
  | "everything"
  | "tracks"
  | "people"
  | "albums"
  | "playlists";

// ─── Likes ────────────────────────────────────────────────────────────────────

export interface LikedTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  likesCount: number;
  repostsCount: number;
  commentsCount: number;
  playsCount: number;
}
