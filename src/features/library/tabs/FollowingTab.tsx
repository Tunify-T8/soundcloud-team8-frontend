import { useEffect, useState } from "react";
import { followingService } from "../../following/followingService";
import type { UserFollowing } from "../../../shared/types/User";
import UserCard from "../../following/components/UserCard";
import { Link, useParams } from "react-router-dom";
import { useMe } from "../../profile/context/useMe";

export default function FollowingTab() {
  const [following, setFollowing] = useState<UserFollowing[]>([]);
  const [loading, setLoading] = useState(true);

  
const { username } = useParams<{ username: string }>();
const { me } = useMe();

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
      <p className="text-white font-bold text-sm mb-4">
        Hear what the people you follow have posted:
      </p>
      <div className="flex overflow-x-auto gap-6 pb-2" style={{ scrollbarWidth: "none" }}>
        {following.map((user) => (
          <UserCard
            key={user.id}
            id={user.id}
            username={user.username}
            displayName={user.displayName ?? undefined}
            avatarUrl={user.avatarUrl}
            followersCount={user.followersCount}
            verified={user.isCertified}
          />
        ))}
      </div>
    </div>
  );
}