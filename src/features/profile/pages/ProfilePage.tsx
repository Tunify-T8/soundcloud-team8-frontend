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
  UserFollower,
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
  const [openedFollowers, setOpenedFollowers] = useState<UserFollower[]>([]);
  const [openedFollowing, setOpenedFollowing] = useState<UserFollowing[]>([]);
  const [loading, setLoading] = useState(!!username);
  const [error, setError] = useState<string | null>(null);
  const [followersCount, setFollowersCount] = useState<number | null>(null);

  const refreshProfile = useCallback(() => {
    refreshMe();
  }, [refreshMe]);

  useEffect(() => {
    if (publicUser) {
      setFollowersCount(publicUser.followersCount);
    } else if (me) {
      setFollowersCount(me.followersCount);
    }
  }, [publicUser, me]);

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

  useEffect(() => {
    let isMounted = true;
    const targetUserId = isMe ? me?.id : publicUser?.id;

    if (!targetUserId) {
      setOpenedFollowers([]);
      return;
    }

    profileService
      .getUserFollowers(targetUserId)
      .then((res) => {
        if (!isMounted) return;
        setOpenedFollowers(res.followers ?? []);
      })
      .catch(() => {
        if (!isMounted) return;
        setOpenedFollowers([]);
      });

    return () => {
      isMounted = false;
    };
  }, [isMe, me?.id, publicUser?.id]);

  if (!username && !me) {
    return <div data-testid="profile-page-loading-me" className="min-h-screen bg-[#0b0b0b] text-white">Loading...</div>;
  }

  if (loading) {
    return <div data-testid="profile-page-loading" className="min-h-screen bg-[#0b0b0b] text-white">Loading...</div>;
  }

  const user = username ? publicUser : me;

  if (error || !user) {
    return (
      <div data-testid="profile-page-error" className="min-h-screen bg-[#0b0b0b] text-white">
        {error || "User not found."}
      </div>
    );
  }
  const userLocation = user.location ?? "";
  const locationParts = userLocation.split(",");
  const city = locationParts[0]?.trim() ?? undefined;
  const country = locationParts[1]?.trim() ?? undefined;
  const sidebarProps = {
    profileId: user.id,
    followers: user.followersCount,
    following: user.followingCount,
    tracks: "tracksCount" in user ? (user as any).tracksCount : 0,
    bio: user.bio ?? undefined,
    socialAccounts: isMe ? socialAccounts : undefined,
    followerUsers: openedFollowers.map((u) => ({
      id: u.id,
      username: u.username,
      displayName: u.username,
      avatarUrl: u.avatarUrl ?? "",
      isCertified: false,
    })),
    followingUsers: openedFollowing.map((u) => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName ?? undefined,
      avatarUrl: u.avatarUrl ?? "",
      isCertified: u.isCertified ?? false,
      followersCount: u.followersCount ?? 0,
    })),
    onUnfollowUser: refreshProfile,
  };

  return (
    <div data-testid="profile-page" className="min-h-screen bg-[#0b0b0b] text-white">
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
      <div data-testid="profile-page-user-info" className="relative bg-[#0b0b0b]">
        <UserInfoBar
          displayName={user.displayName ?? undefined}
          username={user.username}
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
          followersCount={followersCount ?? user.followersCount}
          onFollowersChange={setFollowersCount}
        />
        <div data-testid="profile-sidebar-desktop" className="absolute right-[8.333333%] top-full mt-4 hidden lg:block">
          <ProfileSideBar {...sidebarProps} />
        </div>
      </div>
      <div data-testid="profile-page-content" className="bg-[#0b0b0b] min-h-screen pb-28">
        <Outlet />
        <div data-testid="profile-sidebar-mobile" className="mx-auto mt-4 w-10/12 lg:hidden">
          <ProfileSideBar {...sidebarProps} />
        </div>
      </div>
    </div>
  );
}
