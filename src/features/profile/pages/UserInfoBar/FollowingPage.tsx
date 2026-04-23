import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { profileService } from "../../profileService";
import { useMe } from "../../context/useMe";
import type { UserFollowing } from "@/shared/types/User";

export default function FollowingPage() {
  const { username } = useParams<{ username: string }>();
  const { me } = useMe();
  const [following, setFollowing] = useState<UserFollowing[]>([]);
  const [loading, setLoading] = useState(true);

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
            <Link
              key={user.id}
              to={`/${user.id}`}
              className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/50 px-4 py-3 hover:border-zinc-700"
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.avatarUrl ?? "https://i.pravatar.cc/100"}
                  alt={user.username}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <span className="font-semibold">{user.username}</span>
              </div>
              <span className="rounded bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-200">
                Following
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
