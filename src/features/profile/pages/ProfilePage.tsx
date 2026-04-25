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
  UserFollowing,
} from "../../../shared/types/User";

function isMeProfile(
  user: MeUserProfile | PublicUserProfile,
): user is MeUserProfile {
  return "lastLogin" in user;
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { me, socialAccounts, following, refresh: refreshMe } = useMe();
  const isMe = !username;
  const [publicUser, setPublicUser] = useState<PublicUserProfile | null>(null);
  const [openedFollowing, setOpenedFollowing] = useState<UserFollowing[]>([]);
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

  useEffect(() => {
    let isMounted = true;

    if (isMe) {
      setOpenedFollowing(following);
      return;
    }

    const openedUserId = publicUser?.id;
    if (!openedUserId) {
      setOpenedFollowing([]);
      return;
    }

    profileService
      .getUserFollowing(openedUserId)
      .then((res) => {
        if (!isMounted) return;
        setOpenedFollowing(res.following ?? []);
      })
      .catch(() => {
        if (!isMounted) return;
        setOpenedFollowing([]);
      });

    return () => {
      isMounted = false;
    };
  }, [isMe, publicUser?.id, following]);

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
          role={user.role}
          visibility={isMeProfile(user) ? user.visibility : undefined}
          socialAccounts={isMe ? socialAccounts : undefined}
          isMe={isMe}
          userId={user.id}
          onProfileUpdated={refreshProfile}
        />
        <div className="absolute right-[8.333333%] top-full mt-4">
          <ProfileSideBar
            profileId={user.id}  
            followers={user.followersCount}
            following={user.followingCount}
            tracks={"tracksCount" in user ? (user as any).tracksCount : 0}
            bio={user.bio ?? undefined}
            socialAccounts={isMe ? socialAccounts : undefined}
            followingUsers={openedFollowing.map((u) => ({
              id: u.id,
              username: u.username,
              displayName: u.displayName ?? undefined,
              avatarUrl: u.avatarUrl ?? "",
              isCertified: u.isCertified ?? false,
              followersCount: u.followersCount ?? 0,
            }))}
          />
        </div>
      </div>
      <Outlet />
    </div>
  );
}