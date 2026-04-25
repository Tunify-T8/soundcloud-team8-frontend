import type { Genre } from "@/shared/types/Genre";
export type TrackStatus = 'processing' | 'finished' | 'failed'| 'uploading';
export type TrackVisibility = 'public' | 'private';

export interface Track {
  id: string;
  title: string;
  artist: string;
  genre: Genre;
  tags?: string[];
  status?: TrackStatus;
  visibility?: TrackVisibility;
  audioUrl?: string;
  description?: string;
  waveformData?: number[];   
  duration: number;
  date: string;
  likes: number | null;
  comments: number | null;
  reposts: number | null;
  downloads: number | null;
  plays: number | null;
  isHD?: boolean;
  isPrivate?: boolean;
  thumbnailUrl: string | null;
}