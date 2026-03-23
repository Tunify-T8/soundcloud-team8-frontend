import {
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { profileService } from "../profileService";
import type { MeUserProfile, UserFollowing } from "../../../shared/types/User";
import { ProfileContext, type SocialAccounts } from "./ProfileContextDef";

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<MeUserProfile | null>(null);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccounts>({});
  const [following, setFollowing] = useState<UserFollowing[]>([]);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((prev) => prev + 1), []);

  useEffect(() => {
    Promise.all([
      profileService.getMeProfile().catch(() => null),
      profileService.getMeSocialLinks().catch(() => ({})),
      profileService.getMeFollowing().catch(() => ({ following: [] })),
    ]).then(([meData, linksData, followingData]) => {
      setMe(meData);
      setSocialAccounts(linksData);
      setFollowing(followingData.following ?? []);
    });
  }, [tick]);

  return (
    <ProfileContext.Provider value={{ me, socialAccounts, following, refresh }}>
      {children}
    </ProfileContext.Provider>
  );
}
