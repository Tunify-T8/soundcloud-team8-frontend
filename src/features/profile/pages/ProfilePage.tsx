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

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<MeUserProfile | PublicUserProfile | null>(
    null,
  );
  const [followingUsers, setFollowingUsers] = useState<UserFollowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchUser = async () => {
      try {
        let userData: MeUserProfile | PublicUserProfile | null = null;
        let following: UserFollowing[] = [];
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
            const followingRes = await profileService.getMeFollowing();
            following = followingRes.following;
          } catch {
            following = [];
          }
        }
        if (isMounted) {
          setUser(userData);
          setFollowingUsers(following);
        }
      } catch (err: any) {
        if (isMounted) {
          setUser(null);
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
  }, [username]);

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
  return (
    <div className="min-h-screen text-white">
      <Header
        displayName={"displayName" in user ? user.displayName : user.username}
        username={user.username}
        country={"country" in user ? user.country : undefined}
        city={"city" in user ? user.city : undefined}
        isVerified={user.isVerified}
        avatarUrl={user.avatarUrl || ""}
        coverUrl={"coverUrl" in user ? user.coverUrl || "" : ""}
        isEditable={"isEditable" in user ? user.isEditable : false}
      />
      <div className="relative">
        <UserInfoBar
          displayName={"displayName" in user ? user.displayName : user.username}
          avatarUrl={user.avatarUrl || ""}
          country={"country" in user ? user.country : undefined}
          city={"city" in user ? user.city : undefined}
          bio={"bio" in user ? user.bio : undefined}
          socialAccounts={
            "socialAccounts" in user ? user.socialAccounts : undefined
          }
          isEditable={"isEditable" in user ? user.isEditable : false}
        />
        <div className="absolute right-[8.333333%] top-full mt-4">
          <ProfileSideBar
            followers={"followersCount" in user ? user.followersCount : 0}
            following={"followingCount" in user ? user.followingCount : 0}
            tracks={"tracksCount" in user ? user.tracksCount : 0}
            bio={"bio" in user ? user.bio : undefined}
            socialAccounts={"socialAccounts" in user ? user.socialAccounts : {}}
            followingUsers={followingUsers}
          />
        </div>
      </div>
      <Outlet />
    </div>
  );
}
