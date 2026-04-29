import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import SongCard from "@/components/ui/SongCard";
import { feedService } from "@/features/feed/feedservice";
import { getLikedTracks } from "@/features/library/libraryService";
import { useMe } from "@/features/profile/context/useMe";
import { profileService } from "@/features/profile/profileService";
import SocialInfoBar from "../components/SocialInfoBar";

type DisplayLikedTrack = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  likesCount: number;
  repostsCount: number;
  commentsCount: number;
  playsCount: number;
  timeAgo: string;
};

function waveformSeedFromId(id: string): number {
  return Array.from(id).reduce((seed, char, index) => {
    return seed + char.charCodeAt(0) * (index + 1);
  }, 0);
}

function formatCompactCount(value: number): string {
  return Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
}

function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));

  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export default function UserLikesPage() {
  const { username } = useParams<{ username: string }>();
  const { me } = useMe();
  const [tracks, setTracks] = useState<DisplayLikedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [titleName, setTitleName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setTracks([]);
      setAvatarUrl(null);

      try {
        if (me && username === me.username) {
          const data = await getLikedTracks(1, 100);
          if (!mounted) return;

          setTitleName(me.displayName || me.username);
          setAvatarUrl(me.avatarUrl ?? null);
          setTracks(
            (data?.data ?? []).map((item) => ({
              id: item.track.id,
              title: item.track.title,
              artist: item.artist.displayName || item.artist.username,
              coverUrl: item.track.coverUrl,
              likesCount: item.track.likesCount,
              repostsCount: item.track.repostsCount,
              commentsCount: item.track.commentsCount,
              playsCount: 0,
              timeAgo: formatTimeAgo(item.likedAt),
            })),
          );
          return;
        }

        if (!username) {
          if (mounted) {
            setTitleName("");
            setTracks([]);
          }
          return;
        }

        const profile = await profileService.getPublicProfile(username);
        const likedTracks = await feedService.getUserLikes(profile.id, 100);
        if (!mounted) return;

        setTitleName(profile.displayName || profile.username);
        setAvatarUrl(profile.avatarUrl ?? null);
        setTracks(
          likedTracks.map((track) => ({
            id: track.id,
            title: track.title,
            artist: track.artist,
            coverUrl: track.coverUrl,
            likesCount: track.likesCount,
            repostsCount: track.repostsCount,
            commentsCount: track.commentsCount,
            playsCount: track.playsCount,
            timeAgo: "",
          })),
        );
      } catch {
        if (!mounted) return;
        setTitleName("");
        setAvatarUrl(null);
        setTracks([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [username, me?.id, me?.username, me?.displayName, me?.avatarUrl]);

  const title = useMemo(() => {
    return titleName ? `Likes by ${titleName}` : "Likes";
  }, [titleName]);

  if (username === "me" && me?.username) {
    return <Navigate to={`/${me.username}/likes`} replace />;
  }

  const basePath = username ? `/${username}` : "/me";

  return (
    <div
      data-testid="user-likes-page"
      className="mt-10 mr-10 ml-[14rem] pb-32 text-white lg:mr-[19rem] lg:ml-[14rem] lg:pb-36"
    >
      <SocialInfoBar avatarUrl={avatarUrl} title={title} basePath={basePath} />

      {loading ? (
        <div data-testid="user-likes-loading" className="mt-20 text-center text-zinc-400">
          Loading liked tracks...
        </div>
      ) : tracks.length === 0 ? (
        <p data-testid="user-likes-empty" className="mt-20 text-center text-xl font-semibold text-white">
          No liked tracks yet.
        </p>
      ) : (
        <div data-testid="user-likes-list" className="mt-8 flex flex-col gap-8">
          {tracks.map((track) => (
            <SongCard
              key={track.id}
              trackId={track.id}
              entityLinkTo={`/tracks/${track.id}`}
              artistName={track.artist}
              title={track.title}
              coverUrl={track.coverUrl ?? ""}
              timeAgo={track.timeAgo}
              likes={String(track.likesCount)}
              reposts={String(track.repostsCount)}
              comments={String(track.commentsCount)}
              plays={formatCompactCount(track.playsCount)}
              waveformSeed={waveformSeedFromId(track.id)}
              contextTag="Liked track"
              isLikedInitial={true}
              onToggleRepost={() => undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
