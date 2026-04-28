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

const PROFILE_CACHE_KEY = "profile_context_cache_v1";

const ProfileContext = createContext<ProfileContextType>({
  me: null,
  socialAccounts: {},
  following: [],
  subscription: defaultSubscription,
  refresh: () => {},
  setSubscription: () => {},
});

type ProfileCache = {
  me: MeUserProfile | null;
  socialAccounts: SocialAccounts;
  following: UserFollowing[];
  subscription: Subscription;
};

function readProfileCache(): ProfileCache | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProfileCache;
  } catch {
    return null;
  }
}

function writeProfileCache(cache: ProfileCache) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage failures and keep app state in memory.
  }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [cachedProfile] = useState<ProfileCache | null>(() => readProfileCache());
  const [me, setMe] = useState<MeUserProfile | null>(cachedProfile?.me ?? null);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccounts>(
    cachedProfile?.socialAccounts ?? {},
  );
  const [following, setFollowing] = useState<UserFollowing[]>(
    cachedProfile?.following ?? [],
  );
  const [subscription, setSubscriptionState] = useState<Subscription>(
    defaultSubscription,
  );
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((prev) => prev + 1), []);
  const setSubscription = useCallback((nextSubscription: Subscription) => {
    setSubscriptionState(nextSubscription);
  }, []);

  useEffect(() => {
    writeProfileCache({
      me,
      socialAccounts,
      following,
      subscription,
    });
  }, [me, socialAccounts, following, subscription]);

  useEffect(() => {
    Promise.allSettled([
      profileService.getMeProfile(),
      profileService.getMeSocialLinks(),
      followingService.getMeFollowing(),
      subscriptionService.getMySubscription({ fallbackToFree: false }),
    ]).then(([meResult, linksResult, followingResult, subscriptionResult]) => {
      if (meResult.status === "fulfilled") {
        setMe(meResult.value);
      }

      if (linksResult.status === "fulfilled") {
        setSocialAccounts(linksResult.value);
      }

      if (followingResult.status === "fulfilled") {
        setFollowing(followingResult.value.following ?? []);
      }

      if (subscriptionResult.status === "fulfilled") {
        setSubscriptionState(subscriptionResult.value);
      } else {
        setSubscriptionState(defaultSubscription);
      }
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
