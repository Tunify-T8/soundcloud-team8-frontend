import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { followingService } from "../followingService";
import { profileService } from "../../profile/profileService";
import { useMe } from "../../profile/context/useMe";
import type { UserFollower } from "../../../shared/types/User";
import SocialInfoBar from "../components/SocialInfoBar";
import { User } from "lucide-react";

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
        if (username) {
          const [profile, data] = await Promise.all([
            profileService.getPublicProfile(username),
            followingService.getUserFollowers(username),
          ]);
          if (!mounted) return;
          setTitleName(profile.displayName || profile.username);
          setAvatarUrl(profile.avatarUrl ?? null);
          setFollowers(data.followers ?? []);
        } else {
          if (!me?.id) {
            setTitleName("");
            setAvatarUrl(null);
            setFollowers([]);
            return;
          }
          const data = await followingService.getUserFollowers(me.id);
          if (!mounted) return;
          setTitleName(me.displayName || me.username);
          setAvatarUrl(me.avatarUrl ?? null);
          setFollowers(data.followers ?? []);
        }
      } catch {
        if (!mounted) return;
        setAvatarUrl(null);
        setFollowers([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [username, me?.id, me?.displayName, me?.username]);

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
        <p className="mt-20 text-center text-5xl font-semibold text-white">
          No one is following you yet.
        </p>
      ) : (
        <div className="mt-8 flex flex-wrap gap-6">
          {followers.map((user) => (
            <Link key={user.id} to={`/${user.username}`} className="w-44">
              <img
                src={user.avatarUrl ?? "https://i.pravatar.cc/220"}
                alt={user.username}
                className="h-44 w-44 rounded-full object-cover"
              />
              <p className="mt-3 text-2xl font-semibold">{user.username}</p>
              <p className="mt-1 flex items-center gap-1 text-lg text-zinc-400">
                <User size={14} />
                follower
              </p>
            </Link>
          ))}

          {Array.from({ length: Math.max(0, 5 - followers.length) }).map((_, index) => (
            <div key={index} className="h-44 w-44 rounded-md bg-zinc-800/70" />
          ))}
        </div>
      )}
    </div>
  );
}
