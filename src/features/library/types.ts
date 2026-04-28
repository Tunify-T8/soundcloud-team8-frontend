import { Genre } from "@/shared/types/Genre";

export interface TrackItem {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  timeAgo?: string;
  genre?: Genre;
  likes?: string;
  reposts?: string;
  plays?: string;
  comments?: string;
  durationSeconds?: number;
}

export interface CollectionItem {
  id: string;
  title: string;
  subtitle?: string;
  coverUrl?: string;
}

export interface FollowingUser {
  id: string;
  name: string;
  avatarUrl?: string;
  followers: string;
  verified?: boolean;
}

// ==============================
// ENUMS & BASIC TYPES
// ==============================

export type CollectionType = "PLAYLIST" | "ALBUM";

export type CollectionPrivacy = "public" | "private";

// ==============================
// COMMON OBJECTS
// ==============================

export interface UserSummary {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  followerCount: number;
}

export interface TrackSummary {
  id: string;
  title: string;
  durationSeconds: number;
  coverUrl: string | null;
  genreId: string | null;
  isPublic: boolean;
  user: UserSummary;
}

// ==============================
// COLLECTION CORE TYPES
// ==============================

export interface Collection {
  id: string;
  title: string;
  description: string | null;
  type: CollectionType;
  privacy: CollectionPrivacy;
  coverUrl: string | null;
  trackCount: number;
  likeCount: number;
  repostsCount: number;
  isLiked: boolean;
  owner: UserSummary;
  createdAt: string;
  updatedAt: string;
}

// Used in /collections/me and user collections (lighter version)
export interface CollectionPreview {
  id: string;
  title: string;
  description: string | null;
  type: CollectionType;
  privacy: CollectionPrivacy;
  coverUrl: string | null;
  trackCount: number;
  likeCount: number;
  repostsCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==============================
// TRACK IN COLLECTION
// ==============================

export interface CollectionTrack {
  position: number; // 1-based
  addedAt: string;
  track: TrackSummary;
}

// ==============================
// PAGINATION
// ==============================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ==============================
// REQUEST TYPES
// ==============================

// Create Collection (multipart/form-data)
export interface CreateCollectionPayload {
  title: string;
  type: CollectionType;
  privacy: CollectionPrivacy;
  description?: string;
  coverUrl?: File | string;
}

// Update Collection (multipart/form-data)
export interface UpdateCollectionPayload {
  title?: string;
  description?: string;
  privacy?: CollectionPrivacy;
  coverUrl?: File | string;
}

// Add Track
export interface AddTrackPayload {
  trackId: string;
}

// Remove Track
export interface RemoveTrackPayload {
  trackId: string;
}

// Reorder Tracks
export interface ReorderTracksPayload {
  trackIds: string[];
}

// ==============================
// RESPONSE TYPES
// ==============================

export interface CreateCollectionResponse {
  id: string;
  title: string;
  description: string | null;
  type: CollectionType;
  privacy: CollectionPrivacy;
  secretToken: string | null;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCollectionResponse extends CreateCollectionResponse {}

export interface DeleteCollectionResponse {
  message: string;
}

// Tracks
export type GetCollectionTracksResponse = PaginatedResponse<CollectionTrack>;

// My collections
export type GetMyCollectionsResponse = PaginatedResponse<CollectionPreview>;

// User collections
export type GetUserCollectionsResponse = PaginatedResponse<CollectionPreview>;

// Add track
export interface AddTrackResponse {
  id: string;
  collectionId: string;
  trackId: string;
  position: number;
  addedAt: string;
}

// Remove track
export interface RemoveTrackResponse {
  message: string;
}

// Reorder
export interface ReorderTracksResponse {
  message: string;
}

// Like / Unlike
export interface LikeCollectionResponse {
  message: string;
}

export interface UnlikeCollectionResponse {
  message: string;
}

// Embed
export interface EmbedResponse {
  embedCode: string;
}

export interface PlaylistShareResponse {
  shareUrl?: string;
  url?: string;
  deepLink?: string;
  appDeepLink?: string;
}

// ==============================
// SPECIAL ENDPOINTS
// ==============================

// Get by secret token
export interface PrivateCollectionResponse {
  id: string;
  title: string;
  description: string | null;
  type: CollectionType;
  privacy: "private";
  coverUrl: string | null;
  trackCount: number;
  likeCount: number;
  owner: UserSummary;
  createdAt: string;
  updatedAt: string;
}

// ==============================
// QUERY PARAMS TYPES
// ==============================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface CollectionFilterParams extends PaginationParams {
  type?: CollectionType;
}
