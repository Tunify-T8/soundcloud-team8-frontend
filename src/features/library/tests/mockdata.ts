import type { TrackItem, CollectionItem, FollowingUser } from "../types";
import { Genre } from "@/shared/types/Genre";

export const RECENTLY_PLAYED: CollectionItem[] = [
  { id: "rp1", title: "Stranger Things Playlist", subtitle: "althy_xxz", coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80" },
  { id: "rp2", title: "My Playlist", subtitle: "Nada Serag", coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80" },
  { id: "rp3", title: "Dubai Vibes", subtitle: "AmrDiab 2024", coverUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=200&q=80" },
  { id: "rp4", title: "The Fate of Ophelia", subtitle: "Made for Nada Serag", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80" },
  { id: "rp5", title: "Late Night Mix", subtitle: "Mix 2", coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80" },
  { id: "rp6", title: "Apophenia", subtitle: "Made for Nada Serag", coverUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&q=80" },
];

export const LIKED_TRACKS: TrackItem[] = [
  { id: "lt1", title: "Aghla Min Omri", artist: "Amr Diab", coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80", timeAgo: "1 month ago", genre: Genre.POP, likes: "524", reposts: "3", plays: "11.5K", comments: "42", durationSeconds: 255 },
  { id: "lt2", title: "Never Ending Story", artist: "Limahl", coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80", timeAgo: "2 months ago", genre: Genre.POP, likes: "1.2K", reposts: "89", plays: "45K", comments: "120", durationSeconds: 175 },
  { id: "lt3", title: "Every Breath You Take", artist: "The Police", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80", timeAgo: "3 months ago", genre: Genre.ROCK, likes: "3.4K", reposts: "210", plays: "120K", comments: "340", durationSeconds: 254 },
  { id: "lt4", title: "Blinding Lights", artist: "The Weeknd", coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80", timeAgo: "4 months ago", genre: Genre.POP, likes: "9.1K", reposts: "540", plays: "300K", comments: "870", durationSeconds: 200 },
  { id: "lt5", title: "Bohemian Rhapsody", artist: "Queen", coverUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&q=80", timeAgo: "5 months ago", genre: Genre.ROCK, likes: "15K", reposts: "1.2K", plays: "800K", comments: "2.3K", durationSeconds: 354 },
  { id: "lt6", title: "Shape of You", artist: "Ed Sheeran", coverUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=200&q=80", timeAgo: "6 months ago", genre: Genre.POP, likes: "7.4K", reposts: "320", plays: "250K", comments: "540", durationSeconds: 234 },
];

export const ALBUMS: CollectionItem[] = [
  { id: "al1", title: "Divide", subtitle: "Ed Sheeran", coverUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=200&q=80" },
  { id: "al2", title: "A Night at the Opera", subtitle: "Queen", coverUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&q=80" },
  { id: "al3", title: "After Hours", subtitle: "The Weeknd", coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80" },
  { id: "al4", title: "Sout El Hob", subtitle: "Amr Diab", coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80" },
];

export const HISTORY_TRACKS: TrackItem[] = [
  { id: "ht1", title: "Shape of You", artist: "Ed Sheeran", coverUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=200&q=80", timeAgo: "2 hours ago", genre: Genre.POP, likes: "7.4K", reposts: "320", plays: "250K", comments: "540", durationSeconds: 234 },
  { id: "ht2", title: "Bohemian Rhapsody", artist: "Queen", coverUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&q=80", timeAgo: "5 hours ago", genre: Genre.ROCK, likes: "15K", reposts: "1.2K", plays: "800K", comments: "2.3K", durationSeconds: 354 },
  { id: "ht3", title: "Blinding Lights", artist: "The Weeknd", coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80", timeAgo: "1 day ago", genre: Genre.POP, likes: "9.1K", reposts: "540", plays: "300K", comments: "870", durationSeconds: 200 },
  { id: "ht4", title: "Aghla Min Omri", artist: "Amr Diab", coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80", timeAgo: "2 days ago", genre: Genre.POP, likes: "524", reposts: "3", plays: "11.5K", comments: "42", durationSeconds: 255 },
  { id: "ht5", title: "Never Ending Story", artist: "Limahl", coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80", timeAgo: "3 days ago", genre: Genre.POP, likes: "1.2K", reposts: "89", plays: "45K", comments: "120", durationSeconds: 175 },
];

export const FOLLOWING: FollowingUser[] = [
  { id: "fu1", name: "Imagine Dragons", avatarUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80", followers: "5.55M", verified: true },
  { id: "fu2", name: "Limahl", avatarUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80", followers: "2,475" },
  { id: "fu3", name: "Arctic Monkeys", avatarUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&q=80", followers: "1.09M", verified: true },
  { id: "fu4", name: "Billie Eilish", avatarUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80", followers: "3.64M", verified: true },
];