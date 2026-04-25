import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { profileService } from "../../profileService";
import { followingService } from "../../../following/followingService";
import { useMe } from "../../context/useMe";
import type { UserFollowing } from "@/shared/types/User";

export default function FollowingPage() {
  const { username } = useParams<{ username: string }>();
  const { me } = useMe();
  const [following, setFollowing] = useState<UserFollowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingUnfollowId, setPendingUnfollowId] = useState<string | null>(null);

  const handleUnfollow = async (userId: string) => {
    setPendingUnfollowId(userId);
    try {
      await followingService.unfollowUser(userId);
      setFollowing((prev) => prev.filter((user) => user.id !== userId));
    } finally {
      setPendingUnfollowId((current) => (current === userId ? null : current));
    }
  };

  useEffect(() => {
    const isMeRoute = !username;
    if (isMeRoute && !me?.id) {
      if (following.length !== 0) setFollowing([]);
      if (loading) setLoading(false);
      return;
    }

    setLoading(true);
    const request = isMeRoute
      ? profileService.getMeFollowing()
      : profileService.getUserFollowing(username);

    request
      .then((data) => {
        setFollowing(data.following ?? []);
      })
      .catch(() => {
        setFollowing([]);
      })
      .finally(() => setLoading(false));
  }, [username, me?.id]);

  if (loading) {
    return (
      <div className="w-10/12 mx-auto mt-8 text-zinc-400">
        Loading following...
      </div>
    );
  }

  return (
    <div className="w-10/12 mx-auto mt-8 text-white">
      <h2 className="text-xl font-bold mb-4">Following</h2>
      {following.length === 0 ? (
        <p className="text-zinc-400">Not following anyone yet.</p>
      ) : (
        <div className="space-y-3">
          {following.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/50 px-4 py-3 hover:border-zinc-700"
            >
              <Link
                to={`/${user.id}`}
                className="flex items-center gap-3 flex-1"
              >
                <div className="h-10 w-10 rounded-full bg-zinc-700 shrink-0 flex items-center justify-center overflow-hidden">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-zinc-400">
                      {user.username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="font-semibold">{user.username}</span>
              </Link>
              <button
                data-testid={`unfollow-profile-btn-${user.id}`}
                type="button"
                onClick={() => handleUnfollow(user.id)}
                disabled={pendingUnfollowId === user.id}
                className="rounded bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 disabled:opacity-60 transition-colors"
              >
                {pendingUnfollowId === user.id ? "Unfollowing..." : "Following"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
