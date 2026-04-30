import axios from "axios";
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

const FREE_SUBSCRIPTION: Subscription = {
  tier: "free",
  status: "ACTIVE",
  data: null,
};

function parseTier(plan: string): SubscriptionTier {
  const normalized = plan.toLowerCase() as SubscriptionTier;
  return VALID_TIERS.includes(normalized) ? normalized : "free";
}

function normalizeSubscriptionResponse(payload: unknown): Subscription {
  if (!payload || typeof payload !== "object") {
    return FREE_SUBSCRIPTION;
  }

  const candidate = payload as Partial<SubscriptionData> & {
    data?: Partial<SubscriptionData> | null;
    subscription?: Partial<SubscriptionData> | null;
    tier?: string;
    plan?: string;
    status?: SubscriptionStatus;
  };

  const data =
    candidate.data && typeof candidate.data === "object"
      ? candidate.data
      : candidate.subscription && typeof candidate.subscription === "object"
        ? candidate.subscription
        : candidate;

  const plan =
    typeof data.plan === "string"
      ? data.plan
      : typeof candidate.plan === "string"
        ? candidate.plan
        : typeof candidate.tier === "string"
          ? candidate.tier
          : "free";

  const status =
    typeof data.status === "string"
      ? (data.status as SubscriptionStatus)
      : typeof candidate.status === "string"
        ? candidate.status
        : "ACTIVE";

  if (parseTier(plan) === "free" && !("features" in data)) {
    return {
      tier: "free",
      status,
      data: null,
    };
  }

  const expiresAt =
    typeof data.expiresAt === "string"
      ? data.expiresAt
      : typeof (data as { endedAt?: unknown }).endedAt === "string"
        ? (data as { endedAt?: string }).endedAt
        : "";

  return {
    tier: parseTier(plan),
    status,
    data: {
      plan,
      status,
      startedAt: typeof data.startedAt === "string" ? data.startedAt : "",
      expiresAt: expiresAt ?? "",
      autoRenew: typeof data.autoRenew === "boolean" ? data.autoRenew : false,
      features: {
        maxUploads:
          typeof data.features?.maxUploads === "number"
            ? data.features.maxUploads
            : 0,
        adFree: Boolean(data.features?.adFree),
        offlineListening: Boolean(data.features?.offlineListening),
      },
    },
  };
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
    const response = await api.get("/subscriptions/me");
    return normalizeSubscriptionResponse(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 404 || status === 204) {
        return FREE_SUBSCRIPTION;
      }
    }

    if (options?.fallbackToFree === false) {
      throw new Error("Failed to fetch subscription");
    }
    return FREE_SUBSCRIPTION;
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
