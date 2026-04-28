import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Plus, Star, X } from "lucide-react";
import { subscriptionService } from "@/features/premium/premiumService";
import { useMe } from "@/features/profile/context/useMe";
import type { Subscription, SubscriptionTier } from "@/features/premium/types";
import type { CancelSubscriptionResponse } from "@/features/premium/premiumService";

interface MyPlanModalProps {
  onClose: () => void;
}

function formatDate(date?: string) {
  if (!date) return "Unavailable";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPlanCopy(tier: SubscriptionTier) {
  if (tier === "artist-pro") {
    return {
      title: "Your Artist Pro plan",
      accent: "#c9a227",
      accentSoft: "#f6edd4",
      icon: <Star size={13} className="text-white" fill="white" />,
      iconBg: "bg-[#c9a227]",
      perks: [
        "Unlimited uploads",
        "Ad-free listening",
        "Offline listening",
        "Unlimited playlists",
      ],
    };
  }

  return {
    title: "Your Artist plan",
    accent: "#6d5cf6",
    accentSoft: "#ece8ff",
    icon: <Plus size={15} className="text-white" strokeWidth={3} />,
    iconBg: "bg-[#6d5cf6]",
    perks: [
      "180 uploads per month",
      "Track distribution and monetization",
      "Replace tracks without losing stats",
      "Artist tools access",
    ],
  };
}

export default function MyPlanModal({ onClose }: MyPlanModalProps) {
  const { subscription, setSubscription } = useMe();
  const [isCancelling, setIsCancelling] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [latestDate, setLatestDate] = useState<string | null>(subscription.data?.expiresAt ?? null);

  const isCancelled =
    subscription.status === "CANCELLED" || subscription.data?.autoRenew === false;

  const copy = useMemo(() => getPlanCopy(subscription.tier), [subscription.tier]);
  const relevantDateLabel = isCancelled
    ? "Your plan expires on:"
    : "Your plan renews on:";
  const relevantDate = subscription.data?.expiresAt;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    let mounted = true;

    subscriptionService
      .getMySubscription({ fallbackToFree: false })
      .then((latest) => {
        if (!mounted) return;
        setSubscription(latest);
        setLatestDate(latest.data?.expiresAt ?? null);
      })
      .catch(() => {
        if (!mounted) return;
        setLatestDate(subscription.data?.expiresAt ?? null);
      });

    return () => {
      mounted = false;
    };
  }, [setSubscription, subscription.data?.expiresAt]);

  const syncSubscription = async (
    patch?: Partial<NonNullable<Subscription["data"]>> & {
      status?: Subscription["status"];
    }
  ) => {
    try {
      const latest = await subscriptionService.getMySubscription({
        fallbackToFree: false,
      });
      if (latest.data) {
        setSubscription({
          ...latest,
          status: patch?.status ?? latest.status,
          data: patch ? { ...latest.data, ...patch } : latest.data,
        });
        return;
      }
    } catch {
      // Fall back to patching the current in-memory subscription below.
    }

    if (subscription.data && patch) {
      setSubscription({
        ...subscription,
        status: patch.status ?? subscription.status,
        data: { ...subscription.data, ...patch },
      });
    }
  };

  const handleCancel = async () => {
    if (isCancelling || isCancelled) return;

    setIsCancelling(true);
    setFeedback(null);
    try {
      const result: CancelSubscriptionResponse =
        await subscriptionService.cancelSubscription();
      await syncSubscription({
        status: "CANCELLED",
        autoRenew: false,
        expiresAt: result.expiresAt,
      });
      setLatestDate(result.expiresAt);
      setFeedback(
        `Cancellation successful. Your plan will expire on ${formatDate(result.expiresAt)}.`
      );
    } catch {
      setFeedback("We couldn't cancel your subscription right now. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (subscription.tier === "free") {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-[620px] overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200"
        >
          <X size={17} />
        </button>

        <div className="border-b border-zinc-200 bg-gradient-to-br from-white via-white to-zinc-50 px-8 pb-7 pt-9">
          <div className="mb-4 flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${copy.iconBg}`}
            >
              {copy.icon}
            </div>
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.18em] text-zinc-400">
                Current Plan
              </p>
              <h2 className="text-[28px] font-semibold tracking-tight text-zinc-900">
                {copy.title}
              </h2>
            </div>
          </div>
          <p className="max-w-[480px] text-sm leading-6 text-zinc-500">
            Manage your current subscription, review your included perks, and check your
            {isCancelled ? " expiry" : " renewal"} date.
          </p>
        </div>

        <div className="px-8 py-7">
          {feedback && (
            <div
              className="mb-6 rounded-2xl border px-4 py-3 text-sm font-medium"
              style={{
                borderColor: isCancelled ? "#d8c38a" : "#fecaca",
                backgroundColor: isCancelled ? "#fbf6e7" : "#fef2f2",
                color: isCancelled ? "#7a5d12" : "#991b1b",
              }}
            >
              {feedback}
            </div>
          )}

          <div className="mb-7 rounded-[24px] border border-zinc-200 bg-zinc-50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-900">Included perks</span>
              <span
                className="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em]"
                style={{ backgroundColor: copy.accentSoft, color: copy.accent }}
              >
                {subscription.status === "TRIAL" ? "Trial" : subscription.tier}
              </span>
            </div>
            <ul className="space-y-3">
              {copy.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-sm text-zinc-700">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full"
                    style={{ backgroundColor: copy.accent }}
                  >
                    <Check size={13} color="white" strokeWidth={3} />
                  </span>
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[24px] border border-zinc-200 px-5 py-4">
            <p className="text-[12px] font-black uppercase tracking-[0.18em] text-zinc-400">
              {isCancelled ? "Expiry Date" : "Renewal Date"}
            </p>
            <p className="mt-2 text-base font-semibold text-zinc-900">{relevantDateLabel}</p>
            <p className="mt-1 text-sm text-zinc-600">{formatDate(latestDate ?? relevantDate)}</p>
          </div>

          <div className="mt-7 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-bold text-zinc-700 transition-colors hover:border-zinc-500 hover:text-zinc-900"
            >
              Close
            </button>
            <button
              onClick={handleCancel}
              disabled={isCancelling || isCancelled}
              className="rounded-full bg-red-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {isCancelling ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Cancelling...
                </span>
              ) : isCancelled ? (
                "Undo cancel"
              ) : (
                "Cancel my subscription"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
