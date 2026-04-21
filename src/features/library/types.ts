import { Genre } from '@/shared/types/Genre';

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
