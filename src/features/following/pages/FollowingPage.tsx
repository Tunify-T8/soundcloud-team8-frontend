import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { followingService } from "../followingService";
import { profileService } from "../../profile/profileService";
import { useMe } from "../../profile/context/useMe";
import type { UserFollowing } from "../../../shared/types/User";
import SocialInfoBar from "../components/SocialInfoBar";
import { User } from "lucide-react";

export default function FollowingPage() {
  const { username } = useParams<{ username: string }>();
  const { me } = useMe();
  const [following, setFollowing] = useState<UserFollowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingUnfollowId, setPendingUnfollowId] = useState<string | null>(null);
  const [titleName, setTitleName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  async function handleUnfollow(userId: string) {
    setPendingUnfollowId(userId);
    try {
      await followingService.unfollowUser(userId);
      setFollowing((prev) => prev.filter((user) => user.id !== userId));
    } finally {
      setPendingUnfollowId((current) => (current === userId ? null : current));
    }
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        if (username) {
          const [profile, data] = await Promise.all([
            profileService.getPublicProfile(username),
            followingService.getUserFollowing(username),
          ]);
          if (!mounted) return;
          setTitleName(profile.displayName || profile.username);
          setAvatarUrl(profile.avatarUrl ?? null);
          setFollowing(data.following ?? []);
        } else {
          if (!me?.id) {
            setTitleName("");
            setAvatarUrl(null);
            setFollowing([]);
            return;
          }
          const data = await followingService.getMeFollowing();
          if (!mounted) return;
          setTitleName(me.displayName || me.username);
          setAvatarUrl(me.avatarUrl ?? null);
          setFollowing(data.following ?? []);
        }
      } catch {
        if (!mounted) return;
        setAvatarUrl(null);
        setFollowing([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [username, me?.id, me?.displayName, me?.username]);

  const basePath = username ? `/${username}` : "/me";

  return (
    <div className="mx-auto mt-10 w-9/12 text-white">
      <SocialInfoBar
        avatarUrl={avatarUrl}
        title={`${titleName || "User"} is following`}
        basePath={basePath}
      />

      {loading ? (
        <div className="mt-20 text-center text-zinc-400">Loading following...</div>
      ) : following.length === 0 ? (
        <p className="mt-20 text-center text-5xl font-semibold text-white">
          Not following anyone yet.
        </p>
      ) : (
        <div className="mt-8 flex flex-wrap gap-6">
          {following.map((user) => (
            <div key={user.id} className="w-44">
              <Link to={`/${user.username}`}>
                <img
                  src={user.avatarUrl ?? "https://i.pravatar.cc/220"}
                  alt={user.username}
                  className="h-44 w-44 rounded-full object-cover"
                />
                <p className="mt-3 text-2xl font-semibold">{user.username}</p>
              </Link>
              <button
                type="button"
                onClick={() => handleUnfollow(user.id)}
                disabled={pendingUnfollowId === user.id}
                className="mt-1 inline-flex items-center gap-1 text-lg text-zinc-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <User size={14} />
                {pendingUnfollowId === user.id ? "unfollowing..." : "following"}
              </button>
            </div>
          ))}

          {Array.from({ length: Math.max(0, 5 - following.length) }).map((_, index) => (
            <div key={index} className="h-44 w-44 rounded-md bg-zinc-800/70" />
          ))}
        </div>
      )}
    </div>
  );
}
