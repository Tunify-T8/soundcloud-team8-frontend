import { api } from "../../services/api";
import type { Track } from "./types";

export const trackService = {
  async getUploadedTracks(): Promise<Track[]> {
    const { data } = await api.get<Track[]>("/tracks");
    return data ?? [];
  },
};