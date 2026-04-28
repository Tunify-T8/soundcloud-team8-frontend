import { api } from "../auth/services/api";
import type {
  Collection,
  CollectionType,
  CollectionTrack,
  PaginatedResponse,
  GetUserCollectionsResponse,
  CreateCollectionPayload,
  CreateCollectionResponse,
  UpdateCollectionPayload,
  UpdateCollectionResponse,
  AddTrackPayload,
  AddTrackResponse,
  RemoveTrackPayload,
  ReorderTracksPayload,
  RemoveTrackResponse,
  ReorderTracksResponse,
  LikeCollectionResponse,
  UnlikeCollectionResponse,
  PrivateCollectionResponse,
  PlaylistShareResponse,
} from "./types";

export interface HistoryTrack {
  trackId: string;
  title: string;
  artist: string;
  coverUrl: string;
  genre: string;
  releaseDate: string;
  playedAt: string;
  durationSeconds: number;
  engagement: {
    likeCount: number;
    repostCount: number;
    commentCount: number;
    playCount: number;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ListeningHistoryResponse {
  data: HistoryTrack[];
  meta: PaginationMeta;
}

export async function getListeningHistory(
  page = 1,
  limit = 20,
): Promise<ListeningHistoryResponse> {
  const response = await api.get<ListeningHistoryResponse>(
    "/tracks/me/listening-history",
    { params: { page, limit } },
  );
  return response.data;
}

/** Maps API HistoryTrack → local TrackItem used by TrackRow / SongCard */
export function mapHistoryToTrackItem(h: HistoryTrack) {
  return {
    id: h.trackId,
    title: h.title,
    artist: h.artist,
    coverUrl: h.coverUrl,
    timeAgo: formatTimeAgo(h.playedAt),
    durationSeconds: h.durationSeconds, // ← needed for setCurrentTrack
    likes: String(h.engagement.likeCount),
    reposts: String(h.engagement.repostCount),
    comments: String(h.engagement.commentCount),
    plays: String(h.engagement.playCount),
  };
}

function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Liked Tracks ───────────────────────────────────────────

export interface LikedTrackItem {
  likedAt: string;
  track: {
    id: string;
    title: string;
    description?: string;
    audioUrl: string;
    coverUrl: string | null;
    duration: number;
    likesCount: number;
    commentsCount: number;
    repostsCount: number;
    createdAt: string;
  };
  artist: {
    id: string;
    username: string;
    displayName: string | null;
  };
}

export interface LikedTracksResponse {
  data: LikedTrackItem[];
  page: number;
  limit: number;
  hasMore: boolean;
}

export async function getLikedTracks(
  page = 1,
  limit = 20,
): Promise<LikedTracksResponse | null> {
  try {
    const response = await api.get<LikedTracksResponse>(
      "/users/me/liked-tracks",
      { params: { page, limit } },
    );
    console.log("Liked tracks API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch liked tracks:", error);
    return null;
  }
}

/** Maps API LikedTrackItem → TrackItem used by TrackRow / SongCard */
export function mapLikedTrackToTrackItem(item: LikedTrackItem) {
  const { track, likedAt, artist } = item;
  return {
    id: track.id,
    title: track.title,
    artist: artist.displayName || artist.username,
    coverUrl: track.coverUrl ?? undefined,
    timeAgo: formatTimeAgo(likedAt),
    durationSeconds: track.duration,
    likes: String(track.likesCount),
    reposts: String(track.repostsCount),
    comments: String(track.commentsCount),
  };
}

export const playlistService = {
  extractShareUrl(payload: unknown): string | null {
    if (!payload || typeof payload !== "object") return null;

    const obj = payload as Record<string, unknown>;
    const direct =
      obj.shareUrl ??
      obj.shareURL ??
      obj.url ??
      obj.link ??
      obj.shareLink ??
      obj.share_link;

    if (typeof direct === "string" && direct.trim()) {
      return direct;
    }

    const nested = obj.data;
    if (nested && typeof nested === "object") {
      const nestedObj = nested as Record<string, unknown>;
      const nestedUrl =
        nestedObj.shareUrl ??
        nestedObj.shareURL ??
        nestedObj.url ??
        nestedObj.link ??
        nestedObj.shareLink ??
        nestedObj.share_link;
      if (typeof nestedUrl === "string" && nestedUrl.trim()) {
        return nestedUrl;
      }
    }

    return null;
  },

  // ─── Playlist ───────────────────────────────────────────────

  async createCollection(
    payload: CreateCollectionPayload,
  ): Promise<CreateCollectionResponse | null> {
    try {
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("type", payload.type);
      formData.append("privacy", payload.privacy);

      if (payload.description?.trim()) {
        formData.append("description", payload.description.trim());
      }
      if (payload.coverUrl) {
        formData.append("coverUrl", payload.coverUrl);
      }

      const response = await api.post("/collections", formData);
      return response.data as CreateCollectionResponse;
    } catch {
      return null;
    }
  },

  async getMyCollections(page = 1, limit = 20, type?: CollectionType) {
    try {
      const response = await api.get("/collections/me", {
        params: {
          page,
          limit,
          ...(type ? { type } : {}),
        },
      });
      return response.data;
    } catch {
      return null;
    }
  },

  async getUserPlaylists(
    username: string,
    page = 1,
    limit = 20,
  ): Promise<GetUserCollectionsResponse | null> {
    try {
      const response = await api.get<GetUserCollectionsResponse>(
        `/users/${encodeURIComponent(username)}/playlists`,
        { params: { page, limit } },
      );
      return response.data;
    } catch {
      return null;
    }
  },

  async getPlaylistById(id: string): Promise<Collection | null> {
    try {
      const response = await api.get(`/collections/${id}`);
      return response.data as Collection;
    } catch {
      return null;
    }
  },

  async getPlaylistByToken(token: string): Promise<Collection | null> {
    try {
      const response = await api.get(`/collections/token/${token}`);
      return response.data as Collection;
    } catch {
      return null;
    }
  },

  async updateCollection(
    id: string,
    payload: UpdateCollectionPayload,
  ): Promise<UpdateCollectionResponse | null> {
    try {
      const formData = new FormData();

      if (payload.title !== undefined) {
        formData.append("title", payload.title);
      }
      if (payload.description !== undefined) {
        formData.append("description", payload.description);
      }
      if (payload.privacy !== undefined) {
        formData.append("privacy", payload.privacy);
      }
      if (payload.coverUrl) {
        formData.append("coverUrl", payload.coverUrl);
      }

      const response = await api.put(`/collections/${id}`, formData);
      return response.data as UpdateCollectionResponse;
    } catch {
      return null;
    }
  },

  async updatePlaylist(
    id: string,
    payload: UpdateCollectionPayload,
  ): Promise<UpdateCollectionResponse | null> {
    return playlistService.updateCollection(id, payload);
  },

  // ─── Tracks ─────────────────────────────────────────────────

  async getPlaylistTracks(
    id: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<CollectionTrack> | null> {
    try {
      const response = await api.get(`/collections/${id}/tracks`, {
        params: { page, limit },
      });
      return response.data;
    } catch {
      return null;
    }
  },

  async addTrack(id: string, payload: AddTrackPayload): Promise<boolean> {
    try {
      await api.post(`/collections/${id}/tracks/add`, payload);
      return true;
    } catch {
      return false;
    }
  },

  async removeTrack(id: string, payload: RemoveTrackPayload): Promise<boolean> {
    try {
      await api.post(`/collections/${id}/tracks/remove`, payload);
      return true;
    } catch {
      return false;
    }
  },

  async reorderTracks(
    id: string,
    payload: ReorderTracksPayload,
  ): Promise<boolean> {
    try {
      await api.put(`/collections/${id}/tracks/reorder`, payload);
      return true;
    } catch {
      return false;
    }
  },

  // ─── Likes ──────────────────────────────────────────────────

  async likePlaylist(id: string): Promise<boolean> {
    try {
      await api.post(`/collections/${id}/like`);
      return true;
    } catch {
      return false;
    }
  },

  async unlikePlaylist(id: string): Promise<boolean> {
    try {
      await api.delete(`/collections/${id}/like`);
      return true;
    } catch {
      return false;
    }
  },

  // ─── Manage Playlist ────────────────────────────────────────

  async deletePlaylist(id: string): Promise<boolean> {
    try {
      await api.delete(`/collections/${id}`);
      return true;
    } catch {
      return false;
    }
  },

  async getEmbedCode(id: string): Promise<string | null> {
    try {
      const response = await api.get(`/collections/${id}/embed`);
      return response.data.embedCode;
    } catch {
      return null;
    }
  },

  async getPlaylistShareUrl(id: string): Promise<string | null> {
    try {
      const response = await api.get<PlaylistShareResponse>(
        `/collections/${id}/share`,
      );
      return playlistService.extractShareUrl(response.data);
    } catch {
      return null;
    }
  },

  async resetPrivatePlaylistShareUrl(id: string): Promise<string | null> {
    try {
      const response = await api.post<PlaylistShareResponse>(
        `/collections/${id}/share/reset`,
      );
      return playlistService.extractShareUrl(response.data);
    } catch {
      return null;
    }
  },
};
