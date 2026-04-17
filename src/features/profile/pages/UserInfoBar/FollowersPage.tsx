import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { profileService } from "../../profileService";
import { useMe } from "../../context/useMe";
import type { UserFollower } from "@/shared/types/User";

export default function FollowersPage() {
  const { username } = useParams<{ username: string }>();
  const { me } = useMe();
  const [followers, setFollowers] = useState<UserFollower[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = username ?? me?.id;
    if (!id) {
      setFollowers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    profileService
      .getUserFollowers(id)
      .then((data) => {
        setFollowers(data.followers ?? []);
      })
      .catch(() => {
        setFollowers([]);
      })
      .finally(() => setLoading(false));
  }, [username, me?.id]);

  if (loading) {
    return <div className="w-10/12 mx-auto mt-8 text-zinc-400">Loading followers...</div>;
  }

  return (
    <div className="w-10/12 mx-auto mt-8 text-white">
      <h2 className="text-xl font-bold mb-4">Followers</h2>
      {followers.length === 0 ? (
        <p className="text-zinc-400">No followers found.</p>
      ) : (
        <div className="space-y-3">
          {followers.map((user) => (
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
