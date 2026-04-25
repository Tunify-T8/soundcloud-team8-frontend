import { api } from "@/features/auth/services/api";
import type { Subscription, SubscriptionData, SubscriptionStatus, SubscriptionTier } from "./types";

const VALID_TIERS: SubscriptionTier[] = ["free", "artist", "artist-pro"];

function parseTier(plan: string): SubscriptionTier {
  const normalized = plan.toLowerCase() as SubscriptionTier;
  return VALID_TIERS.includes(normalized) ? normalized : "free";
}

async function getMySubscription(): Promise<Subscription> {
  try {
    const data: SubscriptionData = await api.get("/subscriptions/me");
    return {
      tier: parseTier(data.plan),
      status: data.status,
      data,
    };
  } catch {
    // If endpoint fails (e.g. no subscription), yeb2a free
    return {
      tier: "free",
      status: "ACTIVE" as SubscriptionStatus,
      data: null,
    };
  }
}

export const subscriptionService = { getMySubscription };