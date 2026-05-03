import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import SongCard from "@/components/ui/SongCard";
import { profileService } from "@/features/profile/profileService";
import { useMe } from "@/features/profile/context/useMe";
import type { UserTrack } from "@/shared/types/User";

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}

function waveformSeedFromId(id: string): number {
  return id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

export default function PopularTracksPage() {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const userIdFromState =
    (location.state as { userId?: string } | null)?.userId ?? null;
  const { me } = useMe();
  const isMeView = !username || username === me?.username;

  const [tracks, setTracks] = useState<UserTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const tracksRes = isMeView
          ? await profileService.getMePopularTracks(1, 20)
          : await profileService.getUserTracks(
              userIdFromState ?? username ?? "",
              1,
              20,
            );

        if (!isMounted) return;
        setTracks(tracksRes?.tracks ?? []);
      } catch {
        if (!isMounted) return;
        setTracks([]);
        setError("Could not load popular tracks.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [isMeView, username, userIdFromState]);

  const content = useMemo(() => {
    if (loading) return <p data-testid="popular-tracks-loading" className="py-10 text-sm text-zinc-400">Loading popular tracks...</p>;
    if (error) return <p data-testid="popular-tracks-error" className="py-10 text-sm text-red-400">{error}</p>;
    if (tracks.length === 0) return <p data-testid="popular-tracks-empty" className="py-10 text-sm text-zinc-400">No popular tracks yet.</p>;

    return (
      <div data-testid="popular-tracks-list" className="mt-8 space-y-8">
        {tracks.map((track) => (
          <div key={track.id} data-testid={`popular-track-item-${track.id}`}>
            <SongCard
              trackId={track.id}
              artistLinkTo={track.artist?.id ? `/${encodeURIComponent(track.artist.id)}` : track.artist?.username ? `/${encodeURIComponent(track.artist.username)}` : undefined}
              artistRouteState={track.artist?.id ? { userId: track.artist.id } : undefined}
              artistName={
                track.artist?.displayName ||
                track.artist?.username ||
                me?.displayName ||
                me?.username ||
                "Artist"
              }
              title={track.title}
              coverUrl={track.coverUrl ?? undefined}
              timeAgo={formatTimeAgo(track.createdAt)}
              isLikedInitial={Boolean(track.interaction?.isLiked)}
              isRepostedInitial={Boolean(track.interaction?.isReposted)}
              likes={String(track.engagement?.likeCount ?? 0)}
              reposts={String(track.engagement?.repostCount ?? 0)}
              plays={String(track.engagement?.playCount ?? 0)}
              comments={String(track.engagement?.commentCount ?? 0)}
              waveformSeed={waveformSeedFromId(track.id)}
            />
          </div>
        ))}
      </div>
    );
  }, [error, loading, me?.displayName, me?.username, tracks]);

  return (
    <div data-testid="popular-tracks-page" className="w-full min-h-screen bg-[#0b0b0b] text-white">
      <div className="w-full">{content}</div>
    </div>
  );
}
