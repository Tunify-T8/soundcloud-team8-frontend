import { useEffect, useMemo, useState } from "react";
import SongCard from "@/components/ui/SongCard";
import { profileService } from "@/features/profile/profileService";
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

interface ProfileTracksSectionProps {
  username?: string;
  isMeView: boolean;
  meDisplayName?: string | null;
  meUsername?: string;
  className?: string;
  hideEmptyState?: boolean;
}

export default function ProfileTracksSection({
  username,
  isMeView,
  meDisplayName,
  meUsername,
  className = "",
  hideEmptyState = false,
}: ProfileTracksSectionProps) {
  const [tracks, setTracks] = useState<UserTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isMeView) {
          const tracksRes = await profileService.getMeTracks(1, 20);
          if (!isMounted) return;
          setTracks(tracksRes?.tracks ?? []);
          return;
        }

        const tracksRes = await profileService.getUserTracks(
          username || "",
          1,
          20,
        );
        if (!isMounted) return;
        setTracks(tracksRes?.tracks ?? []);
      } catch {
        if (!isMounted) return;
        setTracks([]);
        setError("Could not load tracks.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [isMeView, username]);

  const content = useMemo(() => {
    if (loading)
      return (
        <p
          data-testid="profile-tracks-loading"
          className="py-10 text-sm text-zinc-400"
        >
          Loading tracks...
        </p>
      );
    if (error)
      return (
        <p
          data-testid="profile-tracks-error"
          className="py-10 text-sm text-red-400"
        >
          {error}
        </p>
      );
    if (tracks.length === 0) {
      return hideEmptyState ? null : (
        <p
          data-testid="profile-tracks-empty"
          className="py-10 text-sm text-zinc-400"
        >
          No tracks yet.
        </p>
      );
    }

    return (
      <div data-testid="profile-tracks-list" className="mt-8 space-y-8">
        {tracks.map((track) => (
          <div key={track.id} data-testid={`profile-track-item-${track.id}`}>
            <SongCard
              trackId={track.id}
              artistLinkTo={track.artist?.id ? `/${encodeURIComponent(track.artist.id)}` : track.artist?.username ? `/${encodeURIComponent(track.artist.username)}` : undefined}
              artistRouteState={track.artist?.id ? { userId: track.artist.id } : undefined}
              artistName={
                track.artist?.displayName ||
                track.artist?.username ||
                meDisplayName ||
                meUsername ||
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
  }, [error, loading, meDisplayName, meUsername, tracks]);

  return (
    <div data-testid="profile-tracks-section" className={className}>
      {content}
    </div>
  );
}
