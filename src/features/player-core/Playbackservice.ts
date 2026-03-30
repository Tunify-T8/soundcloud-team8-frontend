import { api } from "@/features/auth/services/api";
import type {
  playbackBundle,
  streamBundle,
  playbackEventPayload,
  streamQuality,
  buildQueueParams,
  queueResponse,
} from "./types";

export const playbackService = {
  /**
   * GET /tracks/{trackId}/playback
   * Fetches track metadata + playability status.
   * Pass privateToken for private tracks shared via link.
   */
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

  /**
   * POST /tracks/{trackId}/stream
   * Requests a signed, time-limited HLS URL for audio playback.
   * Only called when playability.status is "playable" or "preview".
   */
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

  /**
   * PATCH /me/playback/events
   * Reports a playback action (play, pause, seek, complete, heartbeat).
   */
  reportEvent: async (payload: playbackEventPayload): Promise<void> => {
    await api.patch("/me/playback/events", payload);
  },

  /**
   * POST /playback/context
   * Builds an ordered queue from a context (track, album, playlist, artist).
   */
  buildQueue: async (params: buildQueueParams): Promise<queueResponse> => {
    const { data } = await api.post<queueResponse>("/playback/context", {
      contextType:  params.contextType,
      contextId:    params.contextId,
      startTrackId: params.startTrackId ?? params.contextId,
      shuffle:      params.shuffle ?? false,
      repeat:       params.repeat ?? "none",
    });
    return data;
  },
};