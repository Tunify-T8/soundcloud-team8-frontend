import Header from "../components/Header/Header";
import UserInfoBar from "../components/UserInfo/UserInfoBar";
import ProfileSideBar from "../components/UserInfo/ProfileSideBar";
import { Outlet, useParams } from "react-router-dom";
import { profileService } from "../profileService";
import { useEffect, useState, useCallback } from "react";
import { useMe } from "../context/useMe";
import type {
  MeUserProfile,
  PublicUserProfile,
} from "../../../shared/types/User";

function isMeProfile(
  user: MeUserProfile | PublicUserProfile,
): user is MeUserProfile {
  return "lastLogin" in user;
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { me, socialAccounts, following, refresh: refreshMe } = useMe();
  const [publicUser, setPublicUser] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(!!username);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(() => {
    refreshMe();
  }, [refreshMe]);

  useEffect(() => {
    if (!username) return;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await profileService.getPublicProfile(username);
        setPublicUser(data);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (!username && !me) {
    return <div className="min-h-screen text-white">Loading...</div>;
  }

  if (loading) {
    return <div className="min-h-screen text-white">Loading...</div>;
  }

  const user = username ? publicUser : me;

  if (error || !user) {
    return (
      <div className="min-h-screen text-white">
        {error || "User not found."}
      </div>
    );
  }

  const isMe = !username;
  const location = user.location ?? "";
  const locationParts = location.split(",");
  const city = locationParts[0]?.trim() ?? undefined;
  const country = locationParts[1]?.trim() ?? undefined;

  return (
    <div className="min-h-screen text-white">
      <Header
        displayName={user.displayName ?? undefined}
        username={user.username}
        country={country}
        city={city}
        isCertified={isMeProfile(user) ? user.isCertified : false}
        avatarUrl={user.avatarUrl || ""}
        coverUrl={user.coverUrl || ""}
        isMe={isMe}
        onProfileUpdated={refreshProfile}
      />
      <div className="relative">
        <UserInfoBar
          displayName={user.displayName ?? undefined}
          avatarUrl={user.avatarUrl || ""}
          country={country}
          city={city}
          bio={user.bio ?? undefined}
          socialAccounts={isMe ? socialAccounts : undefined}
          isMe={isMe}
          onProfileUpdated={refreshProfile}
        />
        <div className="absolute right-[8.333333%] top-full mt-4">
          <ProfileSideBar
            followers={user.followersCount}
            following={user.followingCount}
            tracks={"tracksCount" in user ? (user as any).tracksCount : 0}
            bio={user.bio ?? undefined}
            socialAccounts={isMe ? socialAccounts : undefined}
            followingUsers={following.map((u) => ({
              id: u.id,
              username: u.username,
              avatarUrl: u.avatarUrl ?? "",
              isCertified: u.isCertified ?? false,
              followersCount: undefined,
            }))}
          />
        </div>
      </div>
      <Outlet />
    </div>
  );
}