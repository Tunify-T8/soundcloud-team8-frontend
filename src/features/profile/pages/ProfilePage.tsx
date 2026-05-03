import Header from "../components/Header/Header";
import UserInfoBar from "../components/UserInfo/UserInfoBar";
import ProfileSideBar from "../components/UserInfo/ProfileSideBar";
import { Outlet, useParams, useLocation } from "react-router-dom";
import { profileService } from "../profileService";
import { useEffect, useState, useCallback, useRef } from "react";
import { useMe } from "../context/useMe";
import { usePlayContext } from "@/hooks/usePlayContext";
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
  const location = useLocation();
  const userIdFromState = (location.state as { userId?: string } | null)?.userId ?? null;

  const { me, socialAccounts, following, refresh: refreshMe } = useMe();
  const isMe = !username;
  const [publicUser, setPublicUser] = useState<PublicUserProfile | null>(null);
  const [openedFollowers, setOpenedFollowers] = useState<UserFollower[]>([]);
  const [openedFollowing, setOpenedFollowing] = useState<UserFollowing[]>([]);
  const [loading, setLoading] = useState(!!username);
  const [error, setError] = useState<string | null>(null);
  
  const [followersCount, setFollowersCount] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false); // New state to track the request
  const isOptimisticRef = useRef(false);

  const refreshProfile = useCallback(() => {
    refreshMe();
  }, [refreshMe]);

  useEffect(() => {
    if (isOptimisticRef.current) return;

    if (publicUser) {
      setFollowersCount(publicUser.followersCount);
    } else if (me) {
      setFollowersCount(me.followersCount);
    }
  }, [publicUser, me]);

  useEffect(() => {
    if (!username) return;
    const identifier = userIdFromState ?? username;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await profileService.getPublicProfile(identifier);
        setPublicUser(data);
        isOptimisticRef.current = false; 
      } catch (err: any) {
        setError(err?.message || "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username, userIdFromState]);

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
    return () => { isMounted = false; };
  }, [isMe, publicUser?.id, following]);

  useEffect(() => {
    if (isOptimisticRef.current) return;

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
    return () => { isMounted = false; };
  }, [isMe, me?.id, publicUser?.id]);

  const user = username ? publicUser : me;

  usePlayContext({
    contextType: "profile",
    contextId: user?.id ?? "",
  });

  if (!username && !me) {
    return <div className="min-h-screen bg-[#0b0b0b] text-white">Loading...</div>;
  }

  if (loading) {
    return <div className="min-h-screen bg-[#0b0b0b] text-white">Loading...</div>;
  }

  if (error || !user) {
    return <div className="min-h-screen bg-[#0b0b0b] text-white">{error || "User not found."}</div>;
  }

  const loc = user.location ?? "";
  const locationParts = loc.split(",");
  const city = locationParts[0]?.trim() ?? undefined;
  const country = locationParts[1]?.trim() ?? undefined;

  const currentFollowers = followersCount ?? user.followersCount;

  const sidebarProps = {
    profileId: user.id,
    followers: currentFollowers,
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
      <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-6 xl:px-8">
        <Header
          displayName={user.displayName ?? undefined}
          username={user.username}
          country={country}
          city={city}
          isCertified={user.isCertified ?? false}
          avatarUrl={user.avatarUrl || ""}
          coverUrl={user.coverUrl || ""}
          isMe={isMe}
          onProfileUpdated={refreshProfile}
        />

        <div className="w-full bg-[#0b0b0b] lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
            <div className="lg:col-span-2">
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
                followersCount={currentFollowers}
                // Pass the updating state to UserInfoBar
                isUpdating={isUpdating} 
                setIsUpdating={setIsUpdating}
                onFollowersChange={(newCount) => {
                  isOptimisticRef.current = true;
                  
                  const isNowFollowing = newCount > (followersCount ?? user.followersCount);
                  
                  if (isNowFollowing && me) {
                    setOpenedFollowers(prev => [{
                      id: me.id,
                      username: me.username,
                      avatarUrl: me.avatarUrl ?? "",
                    } as UserFollower, ...prev]);
                  } else if (!isNowFollowing && me) {
                    setOpenedFollowers(prev => prev.filter(f => f.id !== me.id));
                  }

                  setFollowersCount(newCount);
                }}
              />
            </div>

            <div className="min-w-0">
              <div className="bg-[#0b0b0b] pb-6 lg:pb-28">
                <Outlet />
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-6 pt-4">
                <ProfileSideBar {...sidebarProps} />
              </div>
            </div>
        </div>

        <div className="mt-1 lg:hidden">
          <ProfileSideBar {...sidebarProps} />
        </div>
      </div>
    </div>
  );
}