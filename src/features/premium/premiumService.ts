import { api } from "@/features/auth/services/api";
import type {
  Subscription,
  SubscriptionData,
  SubscriptionStatus,
  SubscriptionTier,
} from "./types";

// ─── Re-export types so callers can import from one place ─────────────────────
export type { Subscription, SubscriptionData, SubscriptionStatus, SubscriptionTier };

// ─── Plan types from GET /subscriptions/plans ────────────────────────────────

export interface PlanFeatures {
  maxUploads: number | "unlimited";
  adFree: boolean;
  offlineListening: boolean;
  playbackAccess: boolean;
  playlistLimit: number | "unlimited";
}

export interface Plan {
  name: string; // "artist" | "artist-pro" | "free"
  monthly_price: number;
  yearly_price: number;
  currency: string;
  features: PlanFeatures;
}

export interface PlansResponse {
  plans: Plan[];
}

// ─── New types for the subscribe endpoint ─────────────────────────────────────

export interface SubscribePayload {
  plan: "artist" | "artist-pro";
  billingCycle: "yearly" | "monthly";
  paymentMethod: "card" | "paypal" | "apple";
  card?: {
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  };
  trialDays: number;
}

export interface SubscribeSuccessResponse {
  message: string;
}

export interface SubscribeErrorResponse {
  error: string;
  message: string;
}

export interface CancelSubscriptionResponse {
  message: string;
  expiresAt: string;
}

const VALID_TIERS: SubscriptionTier[] = ["free", "artist", "artist-pro"];

function parseTier(plan: string): SubscriptionTier {
  const normalized = plan.toLowerCase() as SubscriptionTier;
  return VALID_TIERS.includes(normalized) ? normalized : "free";
}

/**
 * Detects card brand from the leading digits of the card number.
 */
export function detectCardBrand(cardNumber: string): string {
  const raw = cardNumber.replace(/\s/g, "");
  if (/^4/.test(raw)) return "visa";
  if (/^5[1-5]/.test(raw)) return "mastercard";
  if (/^3[47]/.test(raw)) return "amex";
  if (/^6(?:011|5)/.test(raw)) return "discover";
  return "unknown";
}

/**
 * GET /subscriptions/plans
 * Returns all available subscription plans with pricing.
 */
async function getPlans(): Promise<Plan[]> {
  try {
    const response = await api.get<PlansResponse>("/subscriptions/plans");
    return response.data.plans ?? [];
  } catch {
    return [];
  }
}

/**
 * GET /subscriptions/me
 * Returns a fully-typed Subscription. Falls back to free tier on any error.
 */
async function getMySubscription(
  options?: { fallbackToFree?: boolean }
): Promise<Subscription> {
  try {
    const response = await api.get<SubscriptionData>("/subscriptions/me");
    const data = response.data;
    return {
      tier: parseTier(data.plan),
      status: data.status,
      data,
    };
  } catch {
    if (options?.fallbackToFree === false) {
      throw new Error("Failed to fetch subscription");
    }
    return {
      tier: "free",
      status: "ACTIVE" as SubscriptionStatus,
      data: null,
    };
  }
}

/**
 * POST /subscriptions/subscribe
 * Throws a SubscribeErrorResponse on non-2xx so callers can read `.message`.
 */
async function subscribe(
  payload: SubscribePayload
): Promise<SubscribeSuccessResponse> {
  const response = await api.post<SubscribeSuccessResponse>(
    "/subscriptions/subscribe",
    payload
  );
  return response.data;
}

async function cancelSubscription(): Promise<CancelSubscriptionResponse> {
  const response = await api.post<CancelSubscriptionResponse>(
    "/subscriptions/cancel"
  );
  return response.data;
}

export const subscriptionService = {
  getMySubscription,
  getPlans,
  subscribe,
  cancelSubscription,
};
