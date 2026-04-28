import { useEffect, useState } from "react";
import type { SuggestedUser } from "../../../shared/types/User";
import { followingService } from "../followingService";
import { notifySocialGraphUpdated } from "../../profile/socialGraphEvents";
import UserCard from "../components/UserCard";

export default function WhoToFollowPage() {
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    followingService
      .getSuggestedUsers()
      .then((data) => setUsers(data.users ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleFollow = async (userId: string) => {
    setPendingId(userId);
    try {
      await followingService.followUser(userId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      notifySocialGraphUpdated();
    } finally {
      setPendingId(null);
    }
  };

  if (loading) {
    return <div className="mx-auto mt-10 w-10/12 text-zinc-400">Loading suggestions...</div>;
  }

  return (
    <div className="mx-auto mt-10 w-10/12 text-white">
      <h1 className="text-4xl font-bold">Who to follow</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Suggested profiles based on your follows and tracks you liked or played.
      </p>

      {users.length === 0 ? (
        <p className="mt-8 text-zinc-400">No suggestions available right now.</p>
      ) : (
        <div className="mt-8 flex flex-wrap gap-6">
          {users.map((user) => (
            <UserCard
              key={user.id}
              id={user.id}
              username={user.username}
              avatarUrl={user.avatarUrl}
              followersCount={user.followersCount}
              action={
                <button
                  type="button"
                  onClick={() => handleFollow(user.id)}
                  disabled={pendingId === user.id}
                  className="rounded bg-white px-4 py-1 text-sm font-bold text-black hover:bg-zinc-200 disabled:opacity-60"
                >
                  {pendingId === user.id ? "Following..." : "Follow"}
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}