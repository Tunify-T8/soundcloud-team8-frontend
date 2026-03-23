import type { Genre } from "@/shared/types/Genre";
import { api } from "@/features/auth/services/api";
import type { Track } from "../../shared/types/Track";
import type { TrackVisibility } from "@/shared/types/Track";

export interface UpdateTrackPayload {
  id: string;
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

  formData.append("trackId", payload.id);
  formData.append("title", payload.title);
  formData.append("genre", payload.genre);
  formData.append("privacy", payload.privacy);

  payload.tags.forEach(tag => formData.append("tags", tag));

  if (payload.description) {
    formData.append("description", payload.description);
  }

  if (payload.artwork) {
    formData.append("artwork", payload.artwork); 
  }

  const { data } = await api.patch(`/tracks/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}
};
