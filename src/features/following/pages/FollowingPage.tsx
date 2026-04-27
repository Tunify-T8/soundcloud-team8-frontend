import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { followingService } from "../followingService";
import { profileService } from "../../profile/profileService";
import { useMe } from "../../profile/context/useMe";
import type { UserFollowing } from "../../../shared/types/User";
import SocialInfoBar from "../components/SocialInfoBar";
import { User } from "lucide-react";
import UserGrid from "../components/UserGrid";

export default function FollowingPage() {
  const { username } = useParams<{ username: string }>();
  const { me } = useMe();
  const [following, setFollowing] = useState<UserFollowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});
  const [pendingFollowId, setPendingFollowId] = useState<string | null>(null);
  const [titleName, setTitleName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const isOwnFollowingPage = Boolean(me && username === me.username);

  async function handleFollowToggle(userId: string) {
    const wasFollowing = followStates[userId] ?? false;
    setPendingFollowId(userId);
    setFollowStates((prev) => ({ ...prev, [userId]: !wasFollowing }));
    try {
      if (wasFollowing) {
        await followingService.unfollowUser(userId);
        if (isOwnFollowingPage) {
          setFollowing((prev) => prev.filter((user) => user.id !== userId));
        }
      } else {
        await followingService.followUser(userId);
      }
    } catch {
      setFollowStates((prev) => ({ ...prev, [userId]: wasFollowing }));
    } finally {
      setPendingFollowId((current) => (current === userId ? null : current));
    }
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setFollowing([]);
      setFollowStates({});
      setAvatarUrl(null);
      setTitleName(me && username === me.username ? me.displayName || me.username : "");
      try {
        if (me && username === me.username) {
          const data = await followingService.getUserFollowing(me.id);
          if (!mounted) return;
          setTitleName(me.displayName || me.username);
          setAvatarUrl(me.avatarUrl ?? null);
          setFollowing(data.following ?? []);
          setFollowStates(
            Object.fromEntries((data.following ?? []).map((user) => [user.id, true])),
          );
        } else if (username) {
          const profile = await profileService.getPublicProfile(username);
          const data = await followingService.getUserFollowing(profile.id);
          if (!mounted) return;
          setTitleName(profile.displayName || profile.username);
          setAvatarUrl(profile.avatarUrl ?? null);
          setFollowing(data.following ?? []);

          const statusEntries = await Promise.all(
            (data.following ?? []).map(async (user) => {
              if (user.id === me?.id) {
                return [user.id, false] as const;
              }

              try {
                const status = await followingService.getFollowStatus(user.id);
                return [user.id, status.isFollowing] as const;
              } catch {
                return [user.id, false] as const;
              }
            }),
          );
          if (mounted) {
            setFollowStates(Object.fromEntries(statusEntries));
          }
        }
      } catch (e) {
        console.error("fetch failed:", e);
        if (!mounted) return;
        setAvatarUrl(null);
        setFollowing([]);
        setFollowStates({});
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [username, me?.id, me?.username, me?.displayName]);

  if (username === "me" && me?.username) {
    return <Navigate to={`/${me.username}/following`} replace />;
  }

  const basePath = username ? `/${username}` : "/me";

  return (
    <div
      data-testid="following-page"
      className="mt-10 mr-10 ml-[14rem] text-white lg:mr-[19rem] lg:ml-[14rem]"
    >
      <SocialInfoBar
        avatarUrl={avatarUrl}
        title={titleName ? `${titleName} is following` : "Following"}
        basePath={basePath}
      />
      {loading ? (
        <div data-testid="following-loading" className="mt-20 text-center text-zinc-400">Loading following...</div>
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
                  data-testid={`follow-toggle-btn-${user.id}`}
                  type="button"
                  onClick={() => handleFollowToggle(user.id)}
                  disabled={pendingFollowId === user.id}
                  className={`inline-flex items-center gap-1 text-sm disabled:opacity-60 ${
                    followStates[user.id]
                      ? "text-zinc-400 hover:text-white"
                      : "text-white hover:text-zinc-300"
                  }`}
                >
                  <User size={13} />
                  {followStates[user.id] ? "following" : "follow"}
                </button>
              )
            }
          />
        </div>
      )}
    </div>
  );
}
