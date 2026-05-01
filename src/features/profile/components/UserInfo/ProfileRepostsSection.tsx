import { useEffect, useMemo, useState } from "react";
import SongCard from "@/components/ui/SongCard";
import { profileService } from "@/features/profile/profileService";
import type { RepostItemDto } from "@/shared/types/User";

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

interface ProfileRepostsSectionProps {
  isMeView: boolean;
  meDisplayName?: string | null;
  meUsername?: string;
  className?: string;
  hideEmptyState?: boolean;
}

export default function ProfileRepostsSection({
  isMeView,
  meDisplayName,
  meUsername,
  className = "",
  hideEmptyState = false,
}: ProfileRepostsSectionProps) {
  const [reposts, setReposts] = useState<RepostItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!isMeView) {
          if (!isMounted) return;
          setReposts([]);
          return;
        }

        const repostsRes = await profileService.getMeReposts(1, 20);
        if (!isMounted) return;
        setReposts(repostsRes?.data ?? []);
      } catch {
        if (!isMounted) return;
        setReposts([]);
        setError("Could not load reposts.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [isMeView]);

  const content = useMemo(() => {
    if (loading)
      return (
        <p
          data-testid="profile-reposts-loading"
          className="py-10 text-sm text-zinc-400"
        >
          Loading reposts...
        </p>
      );
    if (error)
      return (
        <p
          data-testid="profile-reposts-error"
          className="py-10 text-sm text-red-400"
        >
          {error}
        </p>
      );
    if (!isMeView) {
      return hideEmptyState ? null : (
        <p
          data-testid="profile-reposts-not-available"
          className="py-10 text-sm text-zinc-400"
        >
          Reposts are only available on your profile for now.
        </p>
      );
    }
    if (reposts.length === 0) {
      return hideEmptyState ? null : (
        <p
          data-testid="profile-reposts-empty"
          className="py-10 text-sm text-zinc-400"
        >
          No reposts yet.
        </p>
      );
    }

    return (
      <div data-testid="profile-reposts-list" className="mt-8 space-y-8">
        {reposts.map((item) => (
          <div
            key={item.repostId}
            data-testid={`profile-repost-item-${item.repostId}`}
          >
            <SongCard
              trackId={item.track.id}
              artistName={meDisplayName || meUsername || "Artist"}
              title={item.track.title}
              coverUrl={item.track.coverUrl ?? undefined}
              timeAgo={formatTimeAgo(item.repostedAt)}
              likes={String(item.track.likesCount ?? 0)}
              reposts={String(item.track.repostsCount ?? 0)}
              plays="0"
              comments={String(item.track.commentsCount ?? 0)}
              waveformSeed={waveformSeedFromId(item.track.id)}
            />
          </div>
        ))}
      </div>
    );
  }, [error, isMeView, loading, meDisplayName, meUsername, reposts]);

  return (
    <div data-testid="profile-reposts-section" className={className}>
      {content}
    </div>
  );
}
