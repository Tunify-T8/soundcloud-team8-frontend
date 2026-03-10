import type { Genre } from "@/shared/types/Genre";
export type TrackStatus = 'processing' | 'finished' | 'failed'| 'uploading';
export type TrackVisibility = 'public' | 'private';

export interface Track {
  id: string;
  title: string;
  genre: Genre;
  tags: string[];
  status: TrackStatus;
  visibility: TrackVisibility;
  audioUrl: string;
  description: string;
  waveformData?: number[];   
  duration: number;
  createdAt: string;
}