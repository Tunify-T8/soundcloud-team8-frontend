import { useContext } from "react";
import { ProfileContext } from "@/features/profile/context/ProfileContext"; 
import type { SubscriptionTier } from "@/features/premium/types";

export function useSubscription() {
  const { subscription } = useContext(ProfileContext);

  const tier: SubscriptionTier = subscription?.tier ?? "free";
  const status = subscription?.status ?? "ACTIVE";
  const isActive = status === "ACTIVE" || status === "TRIAL";
  const isFree = tier === "free";
  const isArtist = tier === "artist";
  const isArtistPro = tier === "artist-pro";

  const isAdFree = isActive && (subscription?.data?.features?.adFree ?? false);
  const hasOfflineListening =
    isActive && (subscription?.data?.features?.offlineListening ?? false);
  const maxUploads = subscription?.data?.features?.maxUploads ?? 0;

  return {
    tier,
    status,
    isActive,
    isFree,
    isArtist,
    isArtistPro,
    isAdFree,
    hasOfflineListening,
    maxUploads,
    raw: subscription,
  };
}