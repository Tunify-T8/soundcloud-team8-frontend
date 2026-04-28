import type { FeedItem, FeedResponse, SearchResult, LikedTrack } from '@/features/feed/type';
import { api } from '@/features/auth/services/api';
interface FeedQueryParams {
  page?: number;
  limit?: number;
  includeReposts?: boolean;
  sinceTimestamp?: string;
}

function normalizeLikedTracksPayload(rawPayload: unknown): LikedTrack[] {
  const payload =
    rawPayload && typeof rawPayload === "object"
      ? (rawPayload as Record<string, unknown>)
      : {};
  const rawItems = payload.items ?? payload.tracks ?? payload.data ?? [];

  const asNumber = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const asString = (value: unknown): string | null =>
    typeof value === "string" && value.trim().length > 0 ? value : null;
  const asRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const readNestedString = (
    obj: Record<string, unknown>,
    key: string,
    nestedKey: string,
  ): string | null => {
    const nested = asRecord(obj[key]);
    return asString(nested[nestedKey]);
  };
  const readNestedNumber = (
    obj: Record<string, unknown>,
    key: string,
    nestedKey: string,
  ): number | null => {
    const nested = asRecord(obj[key]);
    if (!(nestedKey in nested)) return null;
    return asNumber(nested[nestedKey]);
  };

  return Array.isArray(rawItems)
    ? rawItems.map((value): LikedTrack => {
      const item = asRecord(value);
      const nestedTrack = asRecord(item.track);
      const source = Object.keys(nestedTrack).length > 0 ? nestedTrack : item;

      const title = asString(source.title) ?? "Untitled Track";
      const artist = asString(source.artist)
        ?? asString(source.artistName)
        ?? readNestedString(item, "artist", "displayName")
        ?? readNestedString(item, "artist", "username")
        ?? readNestedString(source, "owner", "displayName")
        ?? readNestedString(source, "owner", "username")
        ?? readNestedString(source, "uploader", "displayName")
        ?? readNestedString(source, "uploader", "username")
        ?? readNestedString(source, "user", "displayName")
        ?? readNestedString(source, "user", "username")
        ?? "Unknown Artist";

      const coverUrl = asString(source.coverUrl)
        ?? asString(source.cover)
        ?? asString(source.artworkUrl)
        ?? readNestedString(source, "cover", "url")
        ?? readNestedString(source, "artwork", "url")
        ?? null;

      return {
        id: String(source.id ?? source.trackId ?? item.id ?? item.trackId ?? ""),
        title,
        artist,
        coverUrl,
        likesCount: asNumber(
          source.likesCount ??
          source.likeCount ??
          readNestedNumber(source, "engagement", "likeCount") ??
          source.numberOfLikes ??
          item.likesCount ??
          item.numberOfLikes,
        ),
        repostsCount: asNumber(
          source.repostsCount ??
          source.repostCount ??
          readNestedNumber(source, "engagement", "repostCount") ??
          source.numberOfReposts ??
          item.repostsCount ??
          item.numberOfReposts,
        ),
        commentsCount: asNumber(
          source.commentsCount ??
          source.commentCount ??
          readNestedNumber(source, "engagement", "commentCount") ??
          source.numberOfComments ??
          item.commentsCount ??
          item.numberOfComments,
        ),
        playsCount: asNumber(
          source.playsCount ??
          source.playCount ??
          readNestedNumber(source, "engagement", "playCount") ??
          source.numberOfListens ??
          item.playsCount ??
          item.numberOfListens,
        ),
      };
    })
    : [];
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
      const response = await api.get("/users/me/liked-tracks", { params: { limit } });
      return normalizeLikedTracksPayload(response.data);
    } catch {
      return [];
    }
  },

  async getUserLikes(userId: string, limit = 6): Promise<LikedTrack[]> {
    try {
      const response = await api.get(`/users/${encodeURIComponent(userId)}/liked-tracks`, {
        params: { limit },
      });
      return normalizeLikedTracksPayload(response.data);
    } catch {
      return [];
    }
  },
};
