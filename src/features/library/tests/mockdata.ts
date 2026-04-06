import type { TrackItem, CollectionItem, FollowingUser } from "../types";
import { Genre } from "@/shared/types/Genre";

export const RECENTLY_PLAYED: CollectionItem[] = [
  { id: "1", title: "Stranger Things playli...", subtitle: "althy_xxz", coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80" },
  { id: "2", title: "My Playlist", subtitle: "Nada Serag", coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80" },
  { id: "3", title: "Dubai Playlist", subtitle: "AmrDiab · 2024", coverUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=200&q=80" },
  { id: "4", title: "The Fate of Ophelia", subtitle: "Made for Nada Serag", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80" },
  { id: "5", title: "Made for Nada Serag", subtitle: "Mix 2", coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80" },
  { id: "6", title: "apophenia", subtitle: "Made for Nada Serag", coverUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&q=80" },
];

export const LIKED_TRACKS: TrackItem[] = [
  { id: "1", title: "Amr Diab - Aghla Min Omri (Oriental)", artist: "amrdiab", coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80", timeAgo: "1 month ago", genre: Genre.POP, likes: "524", reposts: "3", plays: "11.5K", comments: "42", durationSeconds: 255 },
  { id: "2", title: "Never Ending Story", artist: "Stranger Things", coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80", timeAgo: "2 months ago", genre: Genre.POP, likes: "1.2K", reposts: "89", plays: "45K", comments: "120", durationSeconds: 175 },
  { id: "3", title: "Every Breath You Take", artist: "THE POLICE NOW!", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80", timeAgo: "3 months ago", genre: Genre.ROCK, likes: "3.4K", reposts: "210", plays: "120K", comments: "340", durationSeconds: 254 },
];

export const FOLLOWING: FollowingUser[] = [
  { id: "1", name: "Imagine Dragons", avatarUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80", followers: "5.55M", verified: true },
  { id: "2", name: "Stranger Things", avatarUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80", followers: "2,475" },
  { id: "3", name: "ArcticMonkeys", avatarUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&q=80", followers: "1.09M", verified: true },
  { id: "4", name: "Billie Eilish", avatarUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80", followers: "3.64M", verified: true },
];

export const HISTORY_TRACKS: TrackItem[] = [...LIKED_TRACKS].reverse();
