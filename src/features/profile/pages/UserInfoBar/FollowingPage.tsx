import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { User } from "lucide-react";
import { profileService } from "../../profileService";
import { followingService } from "../../../following/followingService";
import SocialInfoBar from "../../../following/components/SocialInfoBar";
import UserGrid from "../../../following/components/UserGrid";
import { useMe } from "../../context/useMe";
import type { UserFollowing } from "@/shared/types/User";

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
      setFollowing([]);
      setAvatarUrl(null);
      setTitleName(me && username === me.username ? me.displayName || me.username : "");
      try {
        if (me && username === me.username) {
          const data = await followingService.getUserFollowing(me.id);
          if (!mounted) return;
          setTitleName(me.displayName || me.username);
          setAvatarUrl(me.avatarUrl ?? null);
          setFollowing(data.following ?? []);
        } else if (username) {
          const profile = await profileService.getPublicProfile(username);
          const data = await followingService.getUserFollowing(profile.id);
          if (!mounted) return;
          setTitleName(profile.displayName || profile.username);
          setAvatarUrl(profile.avatarUrl ?? null);
          setFollowing(data.following ?? []);
        }
      } catch (e) {
        console.error("fetch failed:", e);
        if (!mounted) return;
        setAvatarUrl(null);
        setFollowing([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [username, me?.id, me?.username, me?.displayName]);

  if (username === "me" && me?.username) {
    return <Navigate to={`/${me.username}/following`} replace />;
  }

  const basePath = username ? `/${username}` : "/me";

  return (
    <div data-testid="following-page" className="mx-auto mt-10 w-9/12 text-white">
      <SocialInfoBar
        avatarUrl={avatarUrl}
        title={titleName ? `${titleName} is following` : "Following"}
        basePath={basePath}
      />
      {loading ? (
        <div data-testid="following-loading" className="mt-20 text-center text-zinc-400">
          Loading following...
        </div>
      ) : following.length === 0 ? (
        <p data-testid="following-empty" className="mt-20 text-center text-xl font-semibold text-white">
          Not following anyone yet.
        </p>
      ) : (
        <div data-testid="following-list" className="mt-8 flex flex-wrap gap-6">
          <UserGrid
            users={following.map((u) => ({
              id: u.id,
              username: u.username,
              avatarUrl: u.avatarUrl,
              followersCount: u.followersCount,
            }))}
            renderAction={(user) =>
              me?.id === user.id ? (
                <span className="text-sm text-zinc-400">You</span>
              ) : (
                <button
                  data-testid={`unfollow-btn-${user.id}`}
                  type="button"
                  onClick={() => handleUnfollow(user.id)}
                  disabled={pendingUnfollowId === user.id}
                  className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white disabled:opacity-60"
                >
                  <User size={13} />
                  {pendingUnfollowId === user.id ? "unfollowing..." : "following"}
                </button>
              )
            }
          />
        </div>
      )}
    </div>
  );
}
