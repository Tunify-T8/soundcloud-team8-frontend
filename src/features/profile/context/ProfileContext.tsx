import {
  createContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { profileService } from "../profileService";
import { followingService } from "../../following/followingService";
import { subscriptionService } from "@/features/premium/premiumService";
import type { MeUserProfile, UserFollowing } from "../../../shared/types/User";
import type { Subscription } from "@/features/premium/types";

type SocialAccounts = {
  instagram?: string;
  youtube?: string;
  spotify?: string;
  tiktok?: string;
  soundcloud?: string;
  twitter?: string;
};

const defaultSubscription: Subscription = {
  tier: "free",
  status: "ACTIVE",
  data: null,

};

type ProfileContextType = {
  me: MeUserProfile | null;
  socialAccounts: SocialAccounts;
  following: UserFollowing[];
  subscription: Subscription;
  refresh: () => void;
  setSubscription: (subscription: Subscription) => void;
};

const ProfileContext = createContext<ProfileContextType>({
  me: null,
  socialAccounts: {},
  following: [],
  subscription: defaultSubscription,
  refresh: () => {},
  setSubscription: () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<MeUserProfile | null>(null);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccounts>({});
  const [following, setFollowing] = useState<UserFollowing[]>([]);
  const [subscription, setSubscription] = useState<Subscription>(defaultSubscription);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((prev) => prev + 1), []);

  useEffect(() => {
    Promise.all([
      profileService.getMeProfile().catch(() => null),
      profileService.getMeSocialLinks().catch(() => ({})),
      followingService.getMeFollowing().catch(() => ({ following: [] })),
      subscriptionService.getMySubscription().catch(() => null),
    ]).then(([meData, linksData, followingData, subscriptionData]) => {
      setMe(meData);
      setSocialAccounts(linksData);
      setFollowing(followingData.following ?? []);
      setSubscription(subscriptionData || defaultSubscription);
    });
  }, [tick]);

  return (
    <ProfileContext.Provider
      value={{ me, socialAccounts, following, subscription, refresh, setSubscription }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export { ProfileContext };
