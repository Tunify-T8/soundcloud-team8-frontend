
export type SubscriptionTier = "free" | "artist" | "artist-pro";

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "TRIAL";

export type SubscriptionData = {
  plan: string;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt: string;
  autoRenew: boolean;
  features: {
    maxUploads: number;
    adFree: boolean;
    offlineListening: boolean;
  };
};

export type Subscription = {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  data: SubscriptionData | null;
};