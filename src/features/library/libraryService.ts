import { api } from "../auth/services/api";

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
  limit = 20
): Promise<ListeningHistoryResponse> {
  const response = await api.get<ListeningHistoryResponse>(
    "/tracks/me/listening-history",
    { params: { page, limit } }
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
    durationSeconds: h.durationSeconds,  // ← needed for setCurrentTrack
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