import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { followingService } from "../followingService";
import { profileService } from "../../profile/profileService";
import { useMe } from "../../profile/context/useMe";
import type { UserFollower } from "../../../shared/types/User";
import SocialInfoBar from "../components/SocialInfoBar";
import UserGrid from "../components/UserGrid";
import { UserPlus } from "lucide-react";

export default function FollowersPage() {
  const { username } = useParams<{ username: string }>();
  const { me } = useMe();
  const [followers, setFollowers] = useState<UserFollower[]>([]);
  const [loading, setLoading] = useState(true);
  const [titleName, setTitleName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});
  const [pendingFollowId, setPendingFollowId] = useState<string | null>(null);

  async function handleFollow(userId: string) {
    setPendingFollowId(userId);
    try {
      await followingService.followUser(userId);
      setFollowStates((prev) => ({ ...prev, [userId]: true }));
    } finally {
      setPendingFollowId(null);
    }
  }

  async function handleUnfollow(userId: string) {
    setPendingFollowId(userId);
    try {
      await followingService.unfollowUser(userId);
      setFollowStates((prev) => ({ ...prev, [userId]: false }));
    } finally {
      setPendingFollowId(null);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        if (me && username === me.username) {
          const data = await followingService.getUserFollowers(me.id);
          if (!mounted) return;
          setTitleName(me.displayName || me.username);
          setAvatarUrl(me.avatarUrl ?? null);
          setFollowers(data.followers ?? []);
          
          // Load follow status for each follower
          const statuses: Record<string, boolean> = {};
          for (const follower of data.followers ?? []) {
            try {
              const status = await followingService.getFollowStatus(follower.id);
              statuses[follower.id] = status.isFollowing;
            } catch {
              statuses[follower.id] = false;
            }
          }
          if (mounted) setFollowStates(statuses);
        } else if (username) {
          const profile = await profileService.getPublicProfile(username);
          const data = await followingService.getUserFollowers(profile.id);
          if (!mounted) return;
          setTitleName(profile.displayName || profile.username);
          setAvatarUrl(profile.avatarUrl ?? null);
          setFollowers(data.followers ?? []);
          
          // Load follow status for each follower
          const statuses: Record<string, boolean> = {};
          for (const follower of data.followers ?? []) {
            try {
              const status = await followingService.getFollowStatus(follower.id);
              statuses[follower.id] = status.isFollowing;
            } catch {
              statuses[follower.id] = false;
            }
          }
          if (mounted) setFollowStates(statuses);
        }
      } catch (e) {
        console.error("fetch failed:", e);
        if (!mounted) return;
        setAvatarUrl(null);
        setFollowers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [username, me?.id, me?.username, me?.displayName]);

  if (username === "me" && me?.username) {
    return <Navigate to={`/${me.username}/followers`} replace />;
  }

  const basePath = username ? `/${username}` : "/me";

  return (
    <div data-testid="followers-page" className="mx-auto mt-10 w-9/12 text-white">
      <SocialInfoBar
        avatarUrl={avatarUrl}
        title={`Followers of ${titleName || "user"}`}
        basePath={basePath}
      />
      {loading ? (
        <div data-testid="followers-loading" className="mt-20 text-center text-zinc-400">Loading followers...</div>
      ) : followers.length === 0 ? (
        <p data-testid="followers-empty" className="mt-20 text-center text-3xl font-semibold text-white">
          No one is following yet.
        </p>
      ) : (
        <div data-testid="followers-list" className="mt-8 flex flex-wrap gap-6">
          <UserGrid
            users={followers.map((u) => ({
              id: u.id,
              username: u.username,
              avatarUrl: u.avatarUrl,
            }))}
            placeholders={5}
            renderAction={(user) => {
              const isFollowing = followStates[user.id] ?? false;
              return (
                <button
                  data-testid={`follow-btn-${user.id}`}
                  type="button"
                  onClick={() =>
                    isFollowing ? handleUnfollow(user.id) : handleFollow(user.id)
                  }
                  disabled={pendingFollowId === user.id}
                  className={`inline-flex items-center gap-1 text-sm disabled:opacity-60 transition-colors ${
                    isFollowing
                      ? "text-zinc-400 hover:text-white"
                      : "text-white hover:text-zinc-300"
                  }`}
                >
                  <UserPlus size={13} />
                  {pendingFollowId === user.id
                    ? isFollowing
                      ? "unfollowing..."
                      : "following..."
                    : isFollowing
                      ? "following"
                      : "follow"}
                </button>
              );
            }}
          />
        </div>
      )}
    </div>
  );
}