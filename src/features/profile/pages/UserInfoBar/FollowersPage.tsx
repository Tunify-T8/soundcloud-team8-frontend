import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { profileService } from "../../profileService";
import { followingService } from "../../../following/followingService";
import { useMe } from "../../context/useMe";
import type { UserFollower } from "@/shared/types/User";

export default function FollowersPage() {
  const { username } = useParams<{ username: string }>();
  const { me } = useMe();
  const [followers, setFollowers] = useState<UserFollower[]>([]);
  const [loading, setLoading] = useState(true);
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});
  const [pendingFollowId, setPendingFollowId] = useState<string | null>(null);

  const handleFollow = async (userId: string) => {
    setPendingFollowId(userId);
    try {
      await followingService.followUser(userId);
      setFollowStates((prev) => ({ ...prev, [userId]: true }));
    } finally {
      setPendingFollowId(null);
    }
  };

  const handleUnfollow = async (userId: string) => {
    setPendingFollowId(userId);
    try {
      await followingService.unfollowUser(userId);
      setFollowStates((prev) => ({ ...prev, [userId]: false }));
    } finally {
      setPendingFollowId(null);
    }
  };

  useEffect(() => {
    const id = username ?? me?.id;
    if (!id) {
      if (followers.length !== 0) setFollowers([]);
      if (loading) setLoading(false);
      return;
    }

    setLoading(true);
    const loadFollowers = async () => {
      try {
        const data = await profileService.getUserFollowers(id);
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
        setFollowStates(statuses);
      } catch {
        setFollowers([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadFollowers();
  }, [username, me?.id]);

  if (loading) {
    return (
      <div className="w-10/12 mx-auto mt-8 text-zinc-400">
        Loading followers...
      </div>
    );
  }

  return (
    <div className="w-10/12 mx-auto mt-8 text-white">
      <h2 className="text-xl font-bold mb-4">Followers</h2>
      {followers.length === 0 ? (
        <p className="text-zinc-400">No followers found.</p>
      ) : (
        <div className="space-y-3">
          {followers.map((user) => {
            const isFollowing = followStates[user.id] ?? false;
            return (
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
                  data-testid={`follow-profile-btn-${user.id}`}
                  type="button"
                  onClick={() =>
                    isFollowing
                      ? handleUnfollow(user.id)
                      : handleFollow(user.id)
                  }
                  disabled={pendingFollowId === user.id}
                  className={`rounded px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-60 ${
                    isFollowing
                      ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                      : "bg-white text-black hover:bg-zinc-200"
                  }`}
                >
                  {pendingFollowId === user.id
                    ? isFollowing
                      ? "Unfollowing..."
                      : "Following..."
                    : isFollowing
                      ? "Following"
                      : "Follow"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
