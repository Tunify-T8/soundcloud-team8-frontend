import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { profileService } from "../../profileService";
import type { BlockedUser } from "@/shared/types/User";
import { notifySocialGraphUpdated } from "../../socialGraphEvents";

export default function BlockedUsersPage() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const loadBlockedUsers = () => {
    setLoading(true);
    profileService
      .getBlockedUsers()
      .then((data) => setBlockedUsers(data.blockedUsers ?? []))
      .catch(() => setBlockedUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const handleUnblock = async (userId: string) => {
    setPendingUserId(userId);
    try {
      await profileService.unblockUser(userId);
      setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));
      notifySocialGraphUpdated();
    } finally {
      setPendingUserId(null);
    }
  };

  if (loading) {
    return <div data-testid="profile-blocked-users-loading" className="w-10/12 mx-auto mt-8 text-zinc-400">Loading blocked users...</div>;
  }

  return (
    <div data-testid="profile-blocked-users-page" className="w-10/12 mx-auto mt-8 text-white">
      <h2 className="text-xl font-bold mb-4">Blocked Users</h2>
      {blockedUsers.length === 0 ? (
        <p data-testid="profile-blocked-users-empty" className="text-zinc-400">No blocked users.</p>
      ) : (
        <div data-testid="profile-blocked-users-list" className="space-y-3">
          {blockedUsers.map((user) => (
            <div
              key={user.id}
              data-testid={`profile-blocked-user-item-${user.id}`}
              className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/50 px-4 py-3"
            >
              <Link data-testid={`profile-blocked-user-link-${user.id}`} to={`/${user.username}`} className="flex items-center gap-3">
                <img
                  src={user.avatarUrl ?? "https://i.pravatar.cc/100"}
                  alt={user.username}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-xs text-zinc-400">Blocked</p>
                </div>
              </Link>
              <button
                data-testid={`profile-unblock-btn-${user.id}`}
                type="button"
                onClick={() => handleUnblock(user.id)}
                disabled={pendingUserId === user.id}
                className="rounded bg-zinc-800 px-3 py-1 text-xs font-bold text-white hover:bg-zinc-700 disabled:opacity-60"
              >
                {pendingUserId === user.id ? "Unblocking..." : "Unblock"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
