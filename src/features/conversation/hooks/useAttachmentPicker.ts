import { useState, useEffect } from "react";
import { api } from "@/features/auth/services/api";

export interface TrackOption {
  id: string;
  title: string;
  coverUrl: string | null;
  type: "TRACK_UPLOAD" | "TRACK_LIKE";
}

export interface CollectionOption {
  id: string;
  title: string;
  coverUrl: string | null;
  type: "PLAYLIST" | "ALBUM";
}

export type AttachmentOption = TrackOption | CollectionOption;

export function useAttachmentPicker(isOpen: boolean) {
  const [uploadedTracks, setUploadedTracks] = useState<TrackOption[]>([]);
  const [likedTracks, setLikedTracks] = useState<TrackOption[]>([]);
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    setError(null);

    Promise.all([
      api.get("/tracks/me").catch(() => ({ data: null })),
      api.get("/users/me/liked-tracks").catch(() => ({ data: null })),
      api.get("/collections/me").catch(() => ({ data: null })),
    ])
      .then(([uploadsRes, likesRes, collectionsRes]) => {
        const uploadsRaw = uploadsRes.data;
        const likesRaw = likesRes.data;
        const collectionsRaw = collectionsRes.data;

        // GET /tracks/me → returns array directly
        const uploadsList: any[] = Array.isArray(uploadsRaw)
          ? uploadsRaw
          : uploadsRaw?.tracks ?? uploadsRaw?.data ?? uploadsRaw?.items ?? [];

        setUploadedTracks(
          uploadsList.map((t: any) => ({
            id: t.id,
            title: t.title ?? t.name ?? "Untitled",
            coverUrl: t.coverUrl ?? t.artworkUrl ?? t.artwork ?? null,
            type: "TRACK_UPLOAD",
          })),
        );

        // GET /users/me/liked-tracks → returns { data: [...] }
        const likesList: any[] = Array.isArray(likesRaw)
          ? likesRaw
          : likesRaw?.data ?? likesRaw?.tracks ?? likesRaw?.items ?? [];

        setLikedTracks(
          likesList.map((t: any) => ({
            id: t.id ?? t.trackId ?? t.track?.id,
            title: t.title ?? t.name ?? t.track?.title ?? "Untitled",
            coverUrl:
              t.coverUrl ??
              t.artworkUrl ??
              t.artwork ??
              t.track?.coverUrl ??
              null,
            type: "TRACK_LIKE",
          })),
        );

        // GET /collections/me → handle both array and wrapped
        const collectionsList: any[] = Array.isArray(collectionsRaw)
          ? collectionsRaw
          : collectionsRaw?.collections ??
            collectionsRaw?.data ??
            collectionsRaw?.items ??
            [];

        setCollections(
          collectionsList.map((c: any) => ({
            id: c.id,
            title: c.title ?? c.name ?? "Untitled",
            coverUrl: c.coverUrl ?? c.artworkUrl ?? c.artwork ?? null,
            type: c.type === "ALBUM" ? "ALBUM" : "PLAYLIST",
          })),
        );
      })
      .catch(() => setError("Failed to load your tracks and playlists."))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  return { uploadedTracks, likedTracks, collections, isLoading, error };
}