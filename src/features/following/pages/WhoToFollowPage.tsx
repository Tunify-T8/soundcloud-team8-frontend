import { useEffect, useState } from "react";
import { followingService } from "../followingService";
import { notifySocialGraphUpdated } from "../../profile/socialGraphEvents";
import { feedService } from "@/features/feed/feedservice";
import type { SuggestedArtist } from "@/features/feed/type";
import UserGrid from "../components/UserGrid";
import { User } from "lucide-react";

export default function WhoToFollowPage() {
  const [users, setUsers] = useState<SuggestedArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    feedService
      .getSuggestedArtists(1, 18)
      .then((data) => setUsers(data))
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
    return (
      <div
        data-testid="who-to-follow-page"
        className="mt-10 mr-10 ml-[14rem] pb-32 text-white lg:mr-[19rem] lg:ml-[14rem] lg:pb-36"
      >
        <div className="mt-20 text-center text-zinc-400">Loading suggestions...</div>
      </div>
    );
  }

  return (
    <div
      data-testid="who-to-follow-page"
      className="mt-10 mr-10 ml-[14rem] pb-32 text-white lg:mr-[19rem] lg:ml-[14rem] lg:pb-36"
    >
      <h1 className="text-3xl font-bold tracking-tight text-white">Who to follow</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Suggested profiles based on your follows and tracks you liked or played.
      </p>

      {users.length === 0 ? (
        <p className="mt-20 text-center text-xl font-semibold text-white">
          No suggestions available right now.
        </p>
      ) : (
        <div data-testid="who-to-follow-list" className="mt-8 flex flex-wrap gap-6">
          <UserGrid
            users={users.map((user) => ({
              id: user.id,
              username: user.username,
              displayName: user.displayName ?? undefined,
              avatarUrl: user.avatarUrl,
              followersCount: user.followersCount,
              verified: user.isCertified,
            }))}
            renderAction={(user) => (
              <button
                data-testid={`follow-suggested-btn-${user.id}`}
                type="button"
                onClick={() => handleFollow(user.id)}
                disabled={pendingId === user.id}
                className="inline-flex items-center gap-1 text-sm text-white transition-colors hover:text-zinc-300 disabled:opacity-60"
              >
                <User size={13} />
                {pendingId === user.id ? "following..." : "follow"}
              </button>
            )}
          />
        </div>
      )}
    </div>
  );
}
