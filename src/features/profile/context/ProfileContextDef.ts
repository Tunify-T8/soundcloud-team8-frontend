import { createContext } from "react";
import type { MeUserProfile, UserFollowing } from "../../../shared/types/User";

export type SocialAccounts = {
  instagram?: string;
  twitter?: string;
  website?: string;
};

export type ProfileContextType = {
  me: MeUserProfile | null;
  socialAccounts: SocialAccounts;
  following: UserFollowing[];
  refresh: () => void;
};

export const ProfileContext = createContext<ProfileContextType>({
  me: null,
  socialAccounts: {},
  following: [],
  refresh: () => {},
});
