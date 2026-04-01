import { api } from "@/features/auth/services/api";
import type {
  playbackBundle,
  streamBundle,
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
   * GET /tracks/{trackId}/stream
   * Requests a signed, time-limited URL for audio playback.
   * Only called when playability.status is "playable" or "preview".
   * Also records a play event on the backend automatically.
   */
  requestStreamUrl: async (trackId: string): Promise<streamBundle> => {
    const { data } = await api.get<streamBundle>(
      `/tracks/${trackId}/stream`
    );
    return data;
  },

  /**
   * POST /tracks/{trackId}/played
   * Called only when the track ends naturally (audio "ended" event).
   * Do NOT call on manual skip or pause.
   */
  reportCompleted: async (trackId: string): Promise<void> => {
    await api.post(`/tracks/${trackId}/played`);
  },

  /**
   * POST /tracks/playback-context
   * Builds an ordered queue from a context (playlist, profile, history).
   */
  buildQueue: async (params: buildQueueParams): Promise<queueResponse> => {
    const { data } = await api.post<queueResponse>("/tracks/playback-context", {
      contextType:  params.contextType,
      contextId:    params.contextId,
      startTrackId: params.startTrackId,
      shuffle:      params.shuffle ?? false,
      repeat:       params.repeat ?? "none",
    });
    return data;
  },
};