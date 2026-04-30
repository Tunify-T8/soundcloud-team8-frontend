import { useEffect, useMemo, useState } from "react";
import SongCard from "@/components/ui/SongCard";
import { playlistService } from "@/features/library/libraryService";
import { profileService } from "@/features/profile/profileService";
import type { CollectionPreview, CollectionTrack } from "@/features/library/types";
import trackFallback from "@/assets/track.jpg";

type AlbumWithTrack = {
  album: CollectionPreview;
  tracks: CollectionTrack[];
};

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function isOwnedCollection(
  album: CollectionPreview,
  meUsername?: string,
): boolean {
  const raw = album as CollectionPreview & {
    owner?: { username?: string | null };
    user?: { username?: string | null };
    author?: { username?: string | null };
  };

  const ownerUsername =
    raw.owner?.username || raw.user?.username || raw.author?.username || "";

  // When owner username is available, rely on it.
  if (ownerUsername && meUsername) {
    return ownerUsername.toLowerCase() === meUsername.toLowerCase();
  }

  // Fallback for inconsistent payloads: liked-only entries are typically marked as liked.
  return !album.isLiked;
}

interface ProfileAlbumsSectionProps {
  username?: string;
  isMeView: boolean;
  meDisplayName?: string | null;
  meUsername?: string;
  className?: string;
  heading?: string;
  sortOrder?: "asc" | "desc";
}

export default function ProfileAlbumsSection({
  username,
  isMeView,
  meDisplayName,
  meUsername,
  className = "",
  heading,
  sortOrder = "desc",
}: ProfileAlbumsSectionProps) {
  const [items, setItems] = useState<AlbumWithTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        let targetUsername = username || "";
        if (!isMeView && targetUsername && isUuidLike(targetUsername)) {
          try {
            const profile = await profileService.getPublicProfile(targetUsername);
            targetUsername = profile.username || targetUsername;
          } catch {
            // fallback to route param if resolve fails
          }
        }

        const res = isMeView
          ? await playlistService.getMyCollections(1, 20, "ALBUM")
          : await playlistService.getUserAlbums(targetUsername, 1, 20);
        const albums = (res?.data ?? []) as CollectionPreview[];
        const visibleAlbums = isMeView
          ? albums.filter((album) => isOwnedCollection(album, meUsername || undefined))
          : albums;

        const withTracks = await Promise.all(
          visibleAlbums.map(async (album) => {
            const tracksRes = await playlistService.getPlaylistTracks(album.id, 1, 20);
            const tracks = tracksRes?.data ?? [];
            return { album, tracks };
          }),
        );

        withTracks.sort((a, b) => {
          const aTime = new Date(a.album.updatedAt || a.album.createdAt || 0).getTime();
          const bTime = new Date(b.album.updatedAt || b.album.createdAt || 0).getTime();
          return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
        });

        if (!isMounted) return;
        setItems(withTracks);
      } catch {
        if (!isMounted) return;
        setError("Could not load albums.");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [isMeView, meUsername, username]);

  const content = useMemo(() => {
    if (loading) return <p data-testid="profile-albums-loading" className="py-10 text-sm text-zinc-400">Loading albums...</p>;
    if (error) return <p data-testid="profile-albums-error" className="py-10 text-sm text-red-400">{error}</p>;
    if (items.length === 0) return <p data-testid="profile-albums-empty" className="py-10 text-sm text-zinc-400">No albums yet.</p>;

    return (
      <div data-testid="profile-albums-list" className="space-y-8 mt-8">
        {items.map(({ album, tracks }) => {
          const firstTrack = tracks[0];
          const mappedTracks = tracks.slice(0, 3).map((ct, i) => ({
            id: ct.track.id,
            number: i + 1,
            title: ct.track.title,
            artist: ct.track.user.displayName || ct.track.user.username,
            avatarUrl: ct.track.coverUrl ?? null,
            playsCount:
              (ct.track as { playCount?: number; playsCount?: number }).playCount ??
              (ct.track as { playCount?: number; playsCount?: number }).playsCount ??
              0,
          }));
          const artistName =
            mappedTracks[0]?.artist ||
            meDisplayName ||
            username ||
            meUsername ||
            "Album";
          const totalPlays = tracks.reduce((sum, ct) => {
            const trackPlays =
              (ct.track as { playCount?: number; playsCount?: number }).playCount ??
              (ct.track as { playCount?: number; playsCount?: number }).playsCount ??
              0;
            return sum + trackPlays;
          }, 0);

          const albumTrackCount = (
            album as CollectionPreview & { tracksCount?: number; totalTracks?: number }
          ).trackCount ??
            (album as CollectionPreview & { tracksCount?: number; totalTracks?: number }).tracksCount ??
            (album as CollectionPreview & { tracksCount?: number; totalTracks?: number }).totalTracks ??
            0;

          return (
            <div key={album.id} data-testid={`profile-album-item-${album.id}`}>
              <SongCard
                trackId={firstTrack?.track.id ?? ""}
                entityLinkTo={`/collections/${album.id}`}
                smallCoverOnMobile
                artistName={artistName}
                title={album.title || "Untitled album"}
                coverUrl={firstTrack?.track.coverUrl ?? album.coverUrl ?? trackFallback}
                timeAgo={formatTimeAgo(album.updatedAt || album.createdAt)}
                contextTag="Album"
                likes={(album.likeCount ?? 0).toString()}
                reposts={(album.repostsCount ?? 0).toString()}
                plays={totalPlays.toString()}
                comments={albumTrackCount.toString()}
                waveformSeed={album.id.length}
                playlistTracks={mappedTracks}
                profileTrackTextStyle="titleWhiteArtistGray"
              />
            </div>
          );
        })}
      </div>
    );
  }, [error, items, loading, meDisplayName, meUsername, username]);

  return (
    <div data-testid="profile-albums-section" className={className}>
      {heading ? <h2 className="text-white text-2xl font-bold">{heading}</h2> : null}
      {content}
    </div>
  );
}
