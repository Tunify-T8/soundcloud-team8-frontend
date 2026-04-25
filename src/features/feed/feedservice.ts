import type { FeedItem, FeedResponse, SearchResult, LikedTrack } from '@/features/feed/type';
import { api } from '@/features/auth/services/api';
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

  async likeTrack(trackId: string): Promise<void> {
    await api.post(`/tracks/${trackId}/like`);
  },

  async unlikeTrack(trackId: string): Promise<void> {
    await api.delete(`/tracks/${trackId}/like`);
  },

  async searchTracks(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    try {
      const response = await api.get("/search/tracks/", { params: { q: query.toLowerCase() } });
      return response.data.data ?? [];
    } catch { return []; }
  },

  async searchPeople(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    try {
      const response = await api.get("/search/people/", { params: { q: query.toLowerCase() } });
      return response.data.data ?? [];
    } catch { return []; }
  },

  async searchCollections(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    try {
      const response = await api.get("/search/collections/", { params: { q: query.toLowerCase() } });
      return response.data.data ?? [];
    } catch { return []; }
  },
  async search(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    try {
      const response = await api.get("/search/", { params: { q: query.toLowerCase() } });
      return response.data.data ?? [];
    } catch { return []; }
  },

  async getMyLikes(limit = 4): Promise<LikedTrack[]> {
    try {
      const response = await api.get("/users/me/likes", { params: { limit } });
      return response.data.items || [];
    } catch {
      return [];
    }
  },
};
