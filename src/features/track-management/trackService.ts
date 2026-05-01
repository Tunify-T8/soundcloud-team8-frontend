import type { Genre } from "@/shared/types/Genre";
import { api } from "@/features/auth/services/api";
import type { Track } from "../../shared/types/Track";
import type { TrackVisibility } from "@/shared/types/Track";

export interface UpdateTrackPayload {
  title : string;
  genre: Genre;
  tags: string[];
  description?: string;
  privacy: TrackVisibility;
  artwork: File | null;
}

type ApiTrackShape = Record<string, unknown>;

function normalizeTrack(data: ApiTrackShape): Track {
  const visibility =
    (data.visibility as TrackVisibility | undefined) ??
    (data.privacy as TrackVisibility | undefined) ??
    (((data.isPrivate as boolean | undefined) ?? false) ? "private" : "public");

  const likes =
    typeof data.likes === "number"
      ? data.likes
      : typeof data.likesCount === "number"
        ? data.likesCount
        : null;

  const comments =
    typeof data.comments === "number"
      ? data.comments
      : typeof data.commentsCount === "number"
        ? data.commentsCount
        : null;

  const reposts =
    typeof data.reposts === "number"
      ? data.reposts
      : typeof data.repostsCount === "number"
        ? data.repostsCount
        : null;

  const downloads =
    typeof data.downloads === "number"
      ? data.downloads
      : typeof data.downloadCount === "number"
        ? data.downloadCount
        : null;

  const plays =
    typeof data.plays === "number"
      ? data.plays
      : typeof data.playCount === "number"
        ? data.playCount
        : null;

  const artistName =
    (data.artist as string | undefined) ??
    (data.artistName as string | undefined) ??
    ((data.artists as Array<{ name?: string }> | undefined)?.[0]?.name ?? "") ??
    ((data.user as { displayName?: string; username?: string } | undefined)?.displayName ??
      (data.user as { displayName?: string; username?: string } | undefined)?.username ??
      "");

  return {
    id: String(data.id ?? data.trackId ?? ""),
    title: String(data.title ?? ""),
    artist: artistName,
    genre: data.genre as Genre | undefined,
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    status: data.status as Track["status"],
    visibility,
    audioUrl:
      typeof data.audioUrl === "string"
        ? data.audioUrl
        : typeof data.streamUrl === "string"
          ? data.streamUrl
          : "",
    description: typeof data.description === "string" ? data.description : "",
    duration:
      typeof data.duration === "number"
        ? data.duration
        : typeof data.durationSeconds === "number"
          ? data.durationSeconds
          : 0,
    date:
      typeof data.date === "string"
        ? data.date
        : typeof data.createdAt === "string"
          ? data.createdAt
          : "",
    likes,
    comments,
    reposts,
    downloads,
    plays,
    isHD: Boolean(data.isHD),
    isPrivate:
      typeof data.isPrivate === "boolean"
        ? data.isPrivate
        : visibility === "private",
    privateToken:
      typeof data.privateToken === "string"
        ? data.privateToken
        : typeof data.secretToken === "string"
          ? data.secretToken
          : typeof data.shareToken === "string"
            ? data.shareToken
            : null,
    thumbnailUrl:
      typeof data.thumbnailUrl === "string"
        ? data.thumbnailUrl
        : typeof data.artworkUrl === "string"
          ? data.artworkUrl
          : typeof data.coverUrl === "string"
            ? data.coverUrl
            : null,
  };
}

export const trackService = {
   async getUploadedTracks(): Promise<Track[]> {
   const { data } = await api.get<ApiTrackShape[]>("/tracks/me");
  return Array.isArray(data) ? data.map(normalizeTrack) : [];
  },

  async getTrackDetails(id: string): Promise<Track> {
    const { data } = await api.get<ApiTrackShape>(`/tracks/${id}`);
    return normalizeTrack(data);
  },

  async deleteTrack(id: string): Promise<void> {
    await api.delete(`/tracks/${id}`);
  },
  
async updateTrack(id: string, payload: UpdateTrackPayload): Promise<Track> {
  const formData = new FormData();

  formData.append("title", payload.title);
  formData.append("genre", payload.genre);

  payload.tags.forEach(tag => formData.append("tags[]", tag));

  if (payload.description) {
    formData.append("description", payload.description);
  }

  formData.append("privacy", payload.privacy);
  
  if (payload.artwork) {
    formData.append("artwork", payload.artwork); 
  }

  //logging form data for debugging
  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }

  const { data } = await api.patch(`/tracks/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return normalizeTrack(data);
}
};
