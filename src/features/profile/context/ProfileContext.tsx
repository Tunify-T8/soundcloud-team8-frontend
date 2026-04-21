import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { profileService } from "../profileService";
import { followingService } from "../../following/followingService";
import type { MeUserProfile, UserFollowing } from "../../../shared/types/User";

type SocialAccounts = {
  instagram?: string;
  youtube?: string;
  spotify?: string;
  tiktok?: string;
  soundcloud?: string;
  twitter?: string;
};

type ProfileContextType = {
  me: MeUserProfile | null;
  socialAccounts: SocialAccounts;
  following: UserFollowing[];
  refresh: () => void;
};

const ProfileContext = createContext<ProfileContextType>({
  me: null,
  socialAccounts: {},
  following: [],
  refresh: () => {},
});

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
      followingService.getMeFollowing().catch(() => ({ following: [] })),
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

export { ProfileContext };
