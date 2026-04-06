import type {
  FeedResponse,
  SearchResult,
  LikedTrack,
} from "@/shared/types/Feed";
import { api } from "@/features/auth/services/api";

interface FeedQueryParams {
  page?: number;
  limit?: number;
  includeReposts?: boolean;
  sinceTimestamp?: string;
}

export const feedService = {
  // ─── Feed ───────────────────────────────────────────────────────────────────

  async getFeed(params: FeedQueryParams = {}): Promise<FeedResponse | null> {
    const {
      page = 1,
      limit = 20,
      includeReposts = true,
      sinceTimestamp,
    } = params;

    try {
      const response = await api.get("/feed", {
        params: {
          page,
          limit,
          includeReposts,
          ...(sinceTimestamp ? { sinceTimestamp } : {}),
        },
      });
      return response.data as FeedResponse;
    } catch {
      return null;
    }
  },

  // ─── Likes ──────────────────────────────────────────────────────────────────
  async likeTrack(trackId: string): Promise<void> {
    await api.post(`/tracks/${trackId}/like`);
  },

  async unlikeTrack(trackId: string): Promise<void> {
    await api.delete(`/tracks/${trackId}/like`);
  },

  // ─── Search ─────────────────────────────────────────────────────────────────
  // Used by both the dropdown (no type) and the full search page (with type)
  async search(query: string, type?: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    try {
      const params: Record<string, string> = { q: query };
      if (type) params.type = type;
      const response = await api.get("/search", { params });
      return response.data.results ?? response.data.items ?? [];
    } catch {
      return [];
    }
  },

  // ─── My Likes (sidebar section) ─────────────────────────────────────────────
  async getMyLikes(limit = 4): Promise<LikedTrack[]> {
    try {
      const response = await api.get("/users/me/likes", { params: { limit } });
      return response.data.items || [];
    } catch {
      return [];
    }
  },
};
