import { api } from "../../services/api";
import type { Track } from "../../shared/types/Track";

export const trackService = {
  async getUploadedTracks(): Promise<Track[]> {
    const { data } = await api.get<Track[]>("/tracks");
    return data ?? [];
  },
};