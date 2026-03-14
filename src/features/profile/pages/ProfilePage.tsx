import Header from "../components/Header/Header";
import UserInfoBar from "../components/UserInfo/UserInfoBar";
import UserInfo from "../components/UserInfo/UserInfo";
import { Outlet } from "react-router-dom";
import { profileService } from "../profileService";
import { useEffect, useState } from "react";
import type { User } from "../../../shared/types/User";
export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await profileService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div className="min-h-screen text-white">Loading...</div>;
  }
  if (!user) {
    return <div className="min-h-screen text-white">User not found.</div>;
  }
  return (
    <div className="min-h-screen text-white">
      <Header displayName={user.displayName} username={user.username} country={user.country} city={user.city} isVerified={user.isVerified} />
      <div className="relative">
        <UserInfoBar displayName={user.displayName} country={user.country} city={user.city} bio={user.bio} />
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
          />
        </div>
      </div>
      <Outlet />
    </div>
  );
}
