import Header from "../components/Header/Header";
import UserInfoBar from "../components/UserInfo/UserInfoBar";
import ProfileSideBar from "../components/UserInfo/ProfileSideBar";
import { Outlet, useParams } from "react-router-dom";
import { profileService } from "../profileService";
import { useEffect, useState } from "react";
import type {
  MeUserProfile,
  PublicUserProfile,
  UserFollowing,
} from "../../../shared/types/User";

function isMeProfile(
  user: MeUserProfile | PublicUserProfile,
): user is MeUserProfile {
  return "email" in user;
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<MeUserProfile | PublicUserProfile | null>(
    null,
  );
  const [socialAccounts, setSocialAccounts] = useState<{
    instagram?: string;
    twitter?: string;
    website?: string;
  }>({});
  const [followingUsers, setFollowingUsers] = useState<UserFollowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const refreshProfile = () => {
    setRefreshTick((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchUser = async () => {
      try {
        let userData: MeUserProfile | PublicUserProfile | null = null;
        let following: UserFollowing[] = [];
        let linksData: { instagram?: string; twitter?: string; website?: string } =
          {};
        if (username) {
          userData = await profileService.getPublicProfile(username);
          if (userData?.id) {
            try {
              const followingRes = await profileService.getUserFollowing(
                userData.id,
              );
              following = followingRes.following;
            } catch {
              following = [];
            }
          }
        } else {
          userData = await profileService.getMeProfile();
          try {
            const socialLinksRes = await profileService.getMeSocialLinks();
            linksData = socialLinksRes.links.reduce(
              (acc, link) => {
                if (link.platform === "INSTAGRAM") acc.instagram = link.url;
                if (link.platform === "TWITTER") acc.twitter = link.url;
                if (link.platform === "WEBSITE") acc.website = link.url;
                return acc;
              },
              {} as { instagram?: string; twitter?: string; website?: string },
            );
          } catch {
            linksData = {};
          }
          try {
            const followingRes = await profileService.getMeFollowing();
            following = followingRes.following;
          } catch {
            following = [];
          }
        }
        if (isMounted) {
          setUser(userData);
          setSocialAccounts(linksData);
          setFollowingUsers(following);
        }
      } catch (err: any) {
        if (isMounted) {
          setUser(null);
          setSocialAccounts({});
          setFollowingUsers([]);
          setError(err?.message || "Failed to fetch user");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();
    return () => {
      isMounted = false;
    };
  }, [username, refreshTick]);

  if (loading) {
    return <div className="min-h-screen text-white">Loading...</div>;
  }
  if (error || !user) {
    return (
      <div className="min-h-screen text-white">
        {error || "User not found."}
      </div>
    );
  }

  const isMe = isMeProfile(user);
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
        isVerified={isMe ? user.isVerified : false}
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
          socialAccounts={socialAccounts}
          isMe={isMe}
          onProfileUpdated={refreshProfile}
        />
        <div className="absolute right-[8.333333%] top-full mt-4">
          <ProfileSideBar
            followers={user.followersCount}
            following={user.followingCount}
            tracks={
              "tracksUploadedCount" in user ? user.tracksUploadedCount : 0
            }
            bio={user.bio ?? undefined}
            socialAccounts={socialAccounts}
            followingUsers={followingUsers.map((u) => ({
              id: u.id,
              username: u.username,
              avatarUrl: u.avatarUrl ?? "",
              isVerified: u.isVerified ?? false,
              followersCount: undefined,
            }))}
          />
        </div>
      </div>
      <Outlet />
    </div>
  );
}
