import { useEffect, useState } from "react";
import { followingService } from "../../following/followingService";
import type { UserFollowing } from "../../../shared/types/User";
import { Link, useParams } from "react-router-dom";
import { useMe } from "../../profile/context/useMe";
import { BadgeCheck } from "lucide-react";

export default function FollowingTab() {
  const [following, setFollowing] = useState<UserFollowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  
const { username } = useParams<{ username: string }>();
const { me } = useMe();

  const normalizedFilter = filter.trim().toLowerCase();
  const visibleFollowing = following.filter((user) => {
    if (!normalizedFilter) return true;

    const displayName = user.displayName?.toLowerCase() ?? "";
    const usernameValue = user.username.toLowerCase();
    return (
      displayName.includes(normalizedFilter) ||
      usernameValue.includes(normalizedFilter)
    );
  });

  useEffect(() => {
    followingService
      .getMeFollowing()
      .then((data) => setFollowing(data.following ?? []))
      .catch(() => setFollowing([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-zinc-400 text-center py-20">Loading...</p>;
  }

    // If someone navigates to /me/following, redirect to their actual username
  if (username === "me" && me?.username) {
    return <Link to={`/${me.username}/following`} replace />;
  }


  if (following.length === 0) {
    return (
      <p className="text-white font-bold text-lg text-center py-20">
        You haven't followed anyone yet
      </p>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-6">
        <p className="text-white font-bold text-sm">
          Hear what the people you follow have posted:
        </p>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter"
          className="w-64 rounded-sm border border-zinc-700 bg-[#282828] px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 outline-none transition focus:border-zinc-500"
        />
      </div>
      {visibleFollowing.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-400">
          No matching profiles.
        </p>
      ) : (
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visibleFollowing.map((user) => (
          <Link
            key={user.id}
            to={`/${user.id}`}
            className="flex min-w-0 flex-col items-center"
          >
            <div className="h-40 w-40 overflow-hidden rounded-full bg-zinc-800 md:h-44 md:w-44">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName ?? user.username}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-zinc-800" />
              )}
            </div>
            <div className="mt-3 flex max-w-full items-center gap-1">
              <p className="truncate text-center text-sm font-semibold text-white">
                {user.displayName ?? user.username}
              </p>
              {user.isCertified ? (
                <BadgeCheck size={13} className="shrink-0 text-blue-400" />
              ) : null}
            </div>
            <p className="mt-0.5 text-xs text-zinc-400">
              {user.followersCount ?? 0} followers
            </p>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
}
