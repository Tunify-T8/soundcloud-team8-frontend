import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { profileService } from "../../profileService";
import type { SuggestedUser } from "@/shared/types/User";
import { notifySocialGraphUpdated } from "../../socialGraphEvents";

export default function SuggestedUsersPage() {
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    profileService
      .getSuggestedUsers()
      .then((data) => setUsers(data.users ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleFollow = async (userId: string) => {
    setPendingUserId(userId);
    try {
      await profileService.followUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      notifySocialGraphUpdated();
    } finally {
      setPendingUserId(null);
    }
  };

  if (loading) {
    return <div data-testid="profile-suggested-users-loading" className="w-10/12 mx-auto mt-8 text-zinc-400">Loading suggestions...</div>;
  }

  return (
    <div data-testid="profile-suggested-users-page" className="w-10/12 mx-auto mt-8 text-white">
      <h2 className="text-xl font-bold mb-4">Suggested Users</h2>
      {users.length === 0 ? (
        <p data-testid="profile-suggested-users-empty" className="text-zinc-400">No suggestions available right now.</p>
      ) : (
        <div data-testid="profile-suggested-users-list" className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              data-testid={`profile-suggested-user-item-${user.id}`}
              className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/50 px-4 py-3"
            >
              <Link data-testid={`profile-suggested-user-link-${user.id}`} to={`/${user.username}`} className="flex items-center gap-3">
                <img
                  src={user.avatarUrl ?? "https://i.pravatar.cc/100"}
                  alt={user.username}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-xs text-zinc-400">
                    {user.followersCount} followers · {user.tracksUploadedCount} tracks
                  </p>
                </div>
              </Link>
              <button
                data-testid={`profile-suggested-user-follow-btn-${user.id}`}
                type="button"
                onClick={() => handleFollow(user.id)}
                disabled={pendingUserId === user.id}
                className="rounded bg-white px-3 py-1 text-xs font-bold text-black hover:bg-zinc-200 disabled:opacity-60"
              >
                {pendingUserId === user.id ? "Following..." : "Follow"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
