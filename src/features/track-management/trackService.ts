import type { Genre } from "@/shared/types/Genre";
import { api } from "@/features/auth/services/api";
import type { Track } from "../../shared/types/Track";
import type { TrackVisibility } from "@/shared/types/Track";

export interface UpdateTrackPayload {
  title : string;
  genre: Genre;
  tags: string[];
  description?: string;
  privacy: TrackVisibility;
  artwork: File | null;
}

export const trackService = {
   async getUploadedTracks(): Promise<Track[]> {
   const { data } = await api.get<Track[]>("/tracks/me");
  return data ?? [];
  },

  async deleteTrack(id: string): Promise<void> {
    await api.delete(`/tracks/${id}`);
  },
  
async updateTrack(id: string, payload: UpdateTrackPayload): Promise<Track> {
  const formData = new FormData();

  formData.append("title", payload.title);
  formData.append("genre", payload.genre);

  payload.tags.forEach(tag => formData.append("tags[]", tag));

  if (payload.description) {
    formData.append("description", payload.description);
  }

  formData.append("privacy", payload.privacy);
  
  if (payload.artwork) {
    formData.append("artwork", payload.artwork); 
  }

  //logging form data for debugging
  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }

  const { data } = await api.patch(`/tracks/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

   return {
    id: data.trackId,
    title: data.title,
    artist: data.artists?.[0]?.name || "",
    genre: data.genre,
    tags: data.tags || [],
    status: data.status,
    visibility: data.privacy,
    audioUrl: data.audioUrl || "",
    description: data.description || "",
    duration: data.durationSeconds || 0,
    date: data.createdAt,
    likes: null,
    comments: null,
    reposts: null,
    downloads: null,
    plays: null,
    thumbnailUrl: data.artworkUrl || null,
  };
}
};
