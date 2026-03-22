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
  artwork: string | null;
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
    const { data } = await api.patch<Track>(`/tracks/${id}`, payload);
    return data;
  },
};
