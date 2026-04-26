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
    const data: PlansResponse = await api.get("/subscriptions/plans");
    return data.plans ?? [];
  } catch {
    return [];
  }
}

/**
 * GET /subscriptions/me
 * Returns a fully-typed Subscription. Falls back to free tier on any error.
 */
async function getMySubscription(): Promise<Subscription> {
  try {
    const data: SubscriptionData = await api.get("/subscriptions/me");
    return {
      tier: parseTier(data.plan),
      status: data.status,
      data,
    };
  } catch {
    return {
      tier: "free",
      status: "ACTIVE" as SubscriptionStatus,
      data: null,
    };
  }
}

/**
 * POST /subscription/subscribe
 * Throws a SubscribeErrorResponse on non-2xx so callers can read `.message`.
 */
async function subscribe(
  payload: SubscribePayload
): Promise<SubscribeSuccessResponse> {
  return api.post("/subscription/subscribe", payload);
}

export const subscriptionService = { getMySubscription, getPlans, subscribe };