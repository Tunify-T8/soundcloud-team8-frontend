import type {
  FeedItem,
  FeedResponse,
  SearchResult,
  LikedTrack,
  SuggestedArtist,
  AutocompleteResults,
} from "@/features/feed/type";
import { api } from "@/features/auth/services/api";
interface FeedQueryParams {
  page?: number;
  limit?: number;
  includeReposts?: boolean;
  sinceTimestamp?: string;
}

interface SuggestedArtistsPayload {
  items?: unknown;
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
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
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
        const artist =
          asString(source.artist) ??
          asString(source.artistName) ??
          readNestedString(item, "artist", "displayName") ??
          readNestedString(item, "artist", "username") ??
          readNestedString(source, "owner", "displayName") ??
          readNestedString(source, "owner", "username") ??
          readNestedString(source, "uploader", "displayName") ??
          readNestedString(source, "uploader", "username") ??
          readNestedString(source, "user", "displayName") ??
          readNestedString(source, "user", "username") ??
          "Unknown Artist";

        const coverUrl =
          asString(source.coverUrl) ??
          asString(source.cover) ??
          asString(source.artworkUrl) ??
          readNestedString(source, "cover", "url") ??
          readNestedString(source, "artwork", "url") ??
          null;

        return {
          id: String(
            source.id ?? source.trackId ?? item.id ?? item.trackId ?? "",
          ),
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

function normalizeLikedTracksResponse(rawPayload: unknown): {
  items: LikedTrack[];
  hasMore: boolean;
} {
  const payload =
    rawPayload && typeof rawPayload === "object"
      ? (rawPayload as Record<string, unknown>)
      : {};
  const meta =
    payload.meta && typeof payload.meta === "object"
      ? (payload.meta as Record<string, unknown>)
      : {};
  const pagination =
    payload.pagination && typeof payload.pagination === "object"
      ? (payload.pagination as Record<string, unknown>)
      : {};
  const pageInfo =
    payload.pageInfo && typeof payload.pageInfo === "object"
      ? (payload.pageInfo as Record<string, unknown>)
      : {};

  const hasMore = Boolean(
    payload.hasMore ??
    meta.hasMore ??
    pagination.hasMore ??
    pageInfo.hasMore ??
    pageInfo.hasNextPage,
  );

  return {
    items: normalizeLikedTracksPayload(rawPayload),
    hasMore,
  };
}

function normalizeSuggestedArtistsPayload(
  rawPayload: unknown,
): SuggestedArtist[] {
  const payload =
    rawPayload && typeof rawPayload === "object"
      ? (rawPayload as SuggestedArtistsPayload)
      : {};
  const rawItems = Array.isArray(payload.items) ? payload.items : [];

  const asRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const asString = (value: unknown): string | null =>
    typeof value === "string" && value.trim().length > 0 ? value : null;
  const asNumber = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return rawItems.map((value) => {
    const item = asRecord(value);

    return {
      id: String(item.id ?? ""),
      username: asString(item.username) ?? "",
      displayName: asString(item.displayName),
      avatarUrl: asString(item.avatarUrl),
      followersCount: asNumber(item.followersCount),
      isCertified: Boolean(item.isCertified),
      isFollowing: Boolean(item.isFollowing),
    };
  });
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
  async searchTracks(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    try {
      const response = await api.get("/search/tracks/", {
        params: { q: query.toLowerCase() },
      });
      return response.data.data ?? [];
    } catch {
      return [];
    }
  },

  async searchPeople(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    try {
      const response = await api.get("/search/people/", {
        params: { q: query.toLowerCase() },
      });
      return response.data.data ?? [];
    } catch {
      return [];
    }
  },

  async searchCollections(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    try {
      const response = await api.get("/search/collections/", {
        params: { q: query.toLowerCase() },
      });
      return response.data.data ?? [];
    } catch {
      return [];
    }
  },
  // Used by the dropdown and "Everything" filter — hits the general endpoint
  async search(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    try {
      const response = await api.get("/search/", {
        params: { q: query.toLowerCase() },
      });
      return response.data.data ?? [];
    } catch {
      return [];
    }
  },

  async searchAutocomplete(query: string): Promise<AutocompleteResults> {
    const trimmed = query.trim();
    if (!trimmed) {
      return { tracks: [], users: [], collections: [] };
    }
    try {
      const response = await api.get("/search/autocomplete", {
        params: { q: trimmed.toLowerCase() },
      });
      const data = response.data ?? {};
      return {
        tracks: (data.tracks ?? []).map((item: any) => ({
          ...item,
          type: "track",
        })),
        users: (data.users ?? []).map((item: any) => ({
          ...item,
          type: "user",
        })),
        collections: (data.collections ?? []).map((item: any) => ({
          ...item,
          type: "collection",
        })),
      };
    } catch {
      return { tracks: [], users: [], collections: [] };
    }
  },

  // ─── My Likes (sidebar section) ─────────────────────────────────────────────
  async getMyLikesPage(
    page = 1,
    limit = 4,
  ): Promise<{ items: LikedTrack[]; hasMore: boolean }> {
    try {
      const response = await api.get("/users/me/liked-tracks", {
        params: { page, limit },
      });
      return normalizeLikedTracksResponse(response.data);
    } catch {
      return { items: [], hasMore: false };
    }
  },

  async getUserLikesPage(
    userId: string,
    page = 1,
    limit = 6,
  ): Promise<{ items: LikedTrack[]; hasMore: boolean }> {
    try {
      const response = await api.get(
        `/users/${encodeURIComponent(userId)}/liked-tracks`,
        {
          params: { page, limit },
        },
      );
      return normalizeLikedTracksResponse(response.data);
    } catch {
      return { items: [], hasMore: false };
    }
  },

  async getMyLikes(limit = 4): Promise<LikedTrack[]> {
    const { items } = await feedService.getMyLikesPage(1, limit);
    return items;
  },

  async getUserLikes(userId: string, limit = 6): Promise<LikedTrack[]> {
    const { items } = await feedService.getUserLikesPage(userId, 1, limit);
    return items;
  },

  async getSuggestedArtists(page = 1, limit = 12): Promise<SuggestedArtist[]> {
    try {
      const response = await api.get("/feed/suggested-artists", {
        params: { page, limit },
      });
      return normalizeSuggestedArtistsPayload(response.data);
    } catch {
      return [];
    }
  },
};
