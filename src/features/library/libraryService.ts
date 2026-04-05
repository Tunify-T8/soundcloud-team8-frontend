import { api } from "../auth/services/api";

export interface HistoryTrack {
  id: string;
  playedAt: string;
  track: {
    id: string;
    title: string;
    artist: string;
    coverUrl: string;
    duration: number;
    playability: "allowed" | "blocked" | "preview";
  };
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ListeningHistoryResponse {
  data: HistoryTrack[];
  meta: PaginationMeta;
}
export async function getListeningHistory(
  page = 1,
  limit = 20
): Promise<ListeningHistoryResponse> {
  const response = await api.get<ListeningHistoryResponse>(
    "/tracks/me/listening-history",
    { params: { page, limit } }
  );
  return response.data;
}

/** Maps API HistoryTrack → local TrackItem used by TrackRow */
export function mapHistoryToTrackItem(h: HistoryTrack) {
  return {
    id: h.track.id,
    title: h.track.title,
    artist: h.track.artist,
    coverUrl: h.track.coverUrl,
    timeAgo: formatTimeAgo(h.playedAt),
    likes: "0",
    reposts: "0",
    plays: "0",
    comments: "0",
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