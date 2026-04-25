import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { followingService } from "../followingService";
import { profileService } from "../../profile/profileService";
import { useMe } from "../../profile/context/useMe";
import type { UserFollower } from "../../../shared/types/User";
import SocialInfoBar from "../components/SocialInfoBar";
import UserGrid from "../components/UserGrid";

export default function FollowersPage() {
  const { username } = useParams<{ username: string }>();
  const { me } = useMe();
  const [followers, setFollowers] = useState<UserFollower[]>([]);
  const [loading, setLoading] = useState(true);
  const [titleName, setTitleName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        if (me && username === me.username) {
          const data = await followingService.getUserFollowers(me.id);
          if (!mounted) return;
          setTitleName(me.displayName || me.username);
          setAvatarUrl(me.avatarUrl ?? null);
          setFollowers(data.followers ?? []);
        } else if (username) {
          const [profile, data] = await Promise.all([
            profileService.getPublicProfile(username),
            followingService.getUserFollowers(username),
          ]);
          if (!mounted) return;
          setTitleName(profile.displayName || profile.username);
          setAvatarUrl(profile.avatarUrl ?? null);
          setFollowers(data.followers ?? []);
        }
      } catch (e) {
        console.error("fetch failed:", e);
        if (!mounted) return;
        setAvatarUrl(null);
        setFollowers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [username, me?.id, me?.username, me?.displayName]);

  if (username === "me" && me?.username) {
    return <Navigate to={`/${me.username}/followers`} replace />;
  }

  const basePath = username ? `/${username}` : "/me";

  return (
    <div className="mx-auto mt-10 w-9/12 text-white">
      <SocialInfoBar
        avatarUrl={avatarUrl}
        title={`Followers of ${titleName || "user"}`}
        basePath={basePath}
      />
      {loading ? (
        <div className="mt-20 text-center text-zinc-400">Loading followers...</div>
      ) : followers.length === 0 ? (
        <p className="mt-20 text-center text-3xl font-semibold text-white">
          No one is following yet.
        </p>
      ) : (
        <div className="mt-8 flex flex-wrap gap-6">
          <UserGrid
            users={followers.map((u) => ({
              id: u.id,
              username: u.username,
              avatarUrl: u.avatarUrl,
            }))}
            placeholders={5}
          />
        </div>
      )}
    </div>
  );
}