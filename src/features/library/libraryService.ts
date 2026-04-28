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

export const playlistService = {
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
};
