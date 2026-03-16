import Header from "../components/Header/Header";
import UserInfoBar from "../components/UserInfo/UserInfoBar";
import UserInfo from "../components/UserInfo/UserInfo";
import { Outlet, useParams } from "react-router-dom";
import { profileService } from "../profileService";
import { useEffect, useState } from "react";
import type { FollowingUser, User } from "../../../shared/types/User";
export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      setLoading(true);

      try {
        const userData = username
          ? await profileService.getUserByUsername(username)
          : await profileService.getCurrentUser();

        if (isMounted) {
          setUser(userData);
        }

        if (userData?.username) {
          try {
            const followingResponse = await profileService.getFollowing(
              userData.username,
            );
            if (isMounted) {
              setFollowingUsers(followingResponse);
            }
          } catch {
            if (isMounted) {
              setFollowingUsers([]);
            }
          }
        } else if (isMounted) {
          setFollowingUsers([]);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [username]);

  if (loading) {
    return <div className="min-h-screen text-white">Loading...</div>;
  }
  if (!user) {
    return <div className="min-h-screen text-white">User not found.</div>;
  }
  return (
    <div className="min-h-screen text-white">
      <Header
        displayName={user.displayName}
        username={user.username}
        country={user.country}
        city={user.city}
        isVerified={user.isVerified}
        avatarUrl={user.avatarUrl}
        coverUrl={user.coverUrl}
        isEditable={user.isEditable}
      />
      <div className="relative">
        <UserInfoBar
          displayName={user.displayName}
          avatarUrl={user.avatarUrl}
          country={user.country}
          city={user.city}
          bio={user.bio}
          socialAccounts={user.socialAccounts}
          isEditable={user.isEditable}
        />
        <div className="absolute right-[8.333333%] top-full mt-4">
          <UserInfo
            followers={user.followersCount}
            following={user.followingCount}
            tracks={user.tracksCount}
            bio={user.bio}
            socialAccounts={{
              facebook: user.socialAccounts?.facebook,
              instagram: user.socialAccounts?.instagram,
              twitter: user.socialAccounts?.twitter,
              youtube: user.socialAccounts?.youtube,
            }}
            followingUsers={followingUsers}
          />
        </div>
      </div>
      <Outlet />
    </div>
  );
}
