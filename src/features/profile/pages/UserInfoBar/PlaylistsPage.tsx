import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import SongCard from "@/components/ui/SongCard";
import { playlistService } from "@/features/library/libraryService";
import type { CollectionPreview, CollectionTrack } from "@/features/library/types";
import { useMe } from "@/features/profile/context/useMe";
import trackFallback from "@/assets/track.jpg";

type PlaylistWithTrack = {
  playlist: CollectionPreview;
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

export default function PlaylistsPage() {
  const { username } = useParams<{ username: string }>();
  const { me } = useMe();
  const isMeView = !username || username === me?.username;

  const [items, setItems] = useState<PlaylistWithTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!isMeView) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await playlistService.getMyCollections(1, 20, "PLAYLIST");
        const playlists = (res?.data ?? []) as CollectionPreview[];

        const withTracks = await Promise.all(
          playlists.map(async (playlist) => {
            const tracksRes = await playlistService.getPlaylistTracks(playlist.id, 1, 20);
            const tracks = tracksRes?.data ?? [];
            return { playlist, tracks };
          }),
        );

        if (!isMounted) return;
        setItems(withTracks);
      } catch {
        if (!isMounted) return;
        setError("Could not load playlists.");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [isMeView]);

  const content = useMemo(() => {
    if (!isMeView) {
      return (
        <p className="py-10 text-sm text-zinc-400">
          Playlists are only available on your own profile right now.
        </p>
      );
    }

    if (loading) {
      return <p className="py-10 text-sm text-zinc-400">Loading playlists...</p>;
    }

    if (error) {
      return <p className="py-10 text-sm text-red-400">{error}</p>;
    }

    if (items.length === 0) {
      return <p className="py-10 text-sm text-zinc-400">No playlists yet.</p>;
    }

    return (
      <div className="space-y-8 mt-8">
        {items.map(({ playlist, tracks }) => {
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
            me?.displayName ||
            me?.username ||
            "Playlist";
          const totalPlays = tracks.reduce((sum, ct) => {
            const trackPlays =
              (ct.track as { playCount?: number; playsCount?: number }).playCount ??
              (ct.track as { playCount?: number; playsCount?: number }).playsCount ??
              0;
            return sum + trackPlays;
          }, 0);

          return (
            <div key={playlist.id}>
              <SongCard
                trackId={firstTrack?.track.id ?? ""}
                entityLinkTo={`/collections/${playlist.id}`}
                smallCoverOnMobile
                artistName={artistName}
                title={playlist.title || "Untitled playlist"}
                coverUrl={firstTrack?.track.coverUrl ?? playlist.coverUrl ?? trackFallback}
                timeAgo={formatTimeAgo(playlist.updatedAt || playlist.createdAt)}
                contextTag="Playlist"
                likes={(playlist.likeCount ?? 0).toString()}
                reposts={(playlist.repostsCount ?? 0).toString()}
                plays={totalPlays.toString()}
                comments={(playlist.trackCount ?? 0).toString()}
                waveformSeed={playlist.id.length}
                playlistTracks={mappedTracks}
              />
            </div>
          );
        })}
      </div>
    );
  }, [isMeView, loading, error, items, me?.displayName, me?.username]);

  return (
    <div className="w-full min-h-screen bg-[#0b0b0b] text-white">
      <div className="flex justify-center w-full">
        <div className="w-10/12 pr-0 lg:pr-[360px]">{content}</div>
      </div>
    </div>
  );
}
