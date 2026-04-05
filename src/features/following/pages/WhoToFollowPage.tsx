import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { SuggestedUser } from "../../../shared/types/User";
import { followingService } from "../followingService";
import { notifySocialGraphUpdated } from "../../profile/socialGraphEvents";

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

      <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {users.length === 0 ? (
          <p className="text-zinc-400">No suggestions available right now.</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="flex flex-col items-center text-center">
              <Link to={`/${user.username}`} className="flex flex-col items-center">
                <img
                  src={user.avatarUrl ?? "https://i.pravatar.cc/200"}
                  alt={user.username}
                  className="h-32 w-32 rounded-full object-cover"
                />
                <p className="mt-3 text-lg font-semibold">{user.username}</p>
                <p className="text-sm text-zinc-400">{user.followersCount} followers</p>
              </Link>
              <button
                type="button"
                onClick={() => handleFollow(user.id)}
                disabled={pendingId === user.id}
                className="mt-3 rounded bg-white px-4 py-1 text-sm font-bold text-black hover:bg-zinc-200 disabled:opacity-60"
              >
                {pendingId === user.id ? "Following..." : "Follow"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
