import { api } from "@/features/auth/services/api";
import type {
  playbackBundle,
  streamBundle,
  playbackEventPayload,
  streamQuality,
} from "./types";

export const playbackService = {
  getPlaybackBundle: async (
    trackId: string,
    privateToken?: string
  ): Promise<playbackBundle> => {
    const params = privateToken ? { privateToken } : {};
    const { data } = await api.get<playbackBundle>(
      `/tracks/${trackId}/playback`,
      { params }
    );
    return data;
  },

  requestStreamUrl: async (
    trackId: string,
    quality: streamQuality = "auto"
  ): Promise<streamBundle> => {
    const { data } = await api.post<streamBundle>(
      `/tracks/${trackId}/stream`,
      { quality }
    );
    return data;
  },

  reportEvent: async (payload: playbackEventPayload): Promise<void> => {
    await api.patch("/me/playback/events", payload);
  },
};