import { useSubscription } from "@/hooks/useSubscription";
import ArtistProUpgradeButton from "@/features/premium/components/ArtistProUpgradeButton";
import SubscriptionBadge from "@/features/premium/components/SubscriptionBadge";

type PlanTone = "free" | "artist" | "artist-pro";

function getPlanLabel(tier: PlanTone) {
  if (tier === "artist-pro") return "Artist Pro";
  if (tier === "artist") return "Artist";
  return "Basic";
}

function getPlanStyling(tier: PlanTone) {
  if (tier === "artist-pro") {
    return {
      card: "bg-[linear-gradient(135deg,#f3da7a_0%,#d3a735_55%,#b98412_100%)] border-[#f4dc8a] text-[#2f2207]",
      title: "text-[#2f2207]",
      copy: "text-[#3e2d09]",
      button: "hidden",
      badge: <SubscriptionBadge tier="artist-pro" size={36} />,
    };
  }

  if (tier === "artist") {
    return {
      card: "bg-[linear-gradient(135deg,#3a2b72_0%,#2d2457_55%,#241d47_100%)] border-[#7560d6] text-white",
      title: "text-white",
      copy: "text-zinc-200",
      button: "text-white",
      badge: <SubscriptionBadge tier="artist" size={36} />,
    };
  }

  return {
    card: "bg-[#343434] border-[#343434] text-white",
    title: "text-white",
    copy: "text-white/95",
    button: "text-black",
    badge: null,
  };
}

export default function PlanCard() {
  const { tier, isArtistPro } = useSubscription();
  const currentTier = (isArtistPro ? "artist-pro" : tier) as PlanTone;
  const planLabel = getPlanLabel(currentTier);
  const styling = getPlanStyling(currentTier);

  return (
    <div className="min-h-screen bg-[#0b0b0b] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Subscriptions</h1>
            <p className="mt-6 text-[28px] font-bold tracking-tight">Current plans</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="space-y-4">
                <div className={`rounded-md border p-5 sm:p-6 ${styling.card}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <h2 className={`text-3xl font-semibold tracking-tight ${styling.title}`}>
                            {planLabel}
                          </h2>
                          {styling.badge}
                        </div>
                        <p className={`mt-6 max-w-2xl text-sm leading-relaxed ${styling.copy}`}>
                          {currentTier === "artist-pro"
                            ? "You are on Artist Pro. Unlimited upload space and advanced features are unlocked for your account."
                            : currentTier === "artist"
                              ? "Artist plans include more upload space and advanced features for growing your catalog."
                              : "Artist Pro plans include unlimited upload space and advanced features."}
                        </p>
                      </div>

                      {currentTier === "artist-pro" ? null : (
                        <div className="flex-shrink-0">
                          <ArtistProUpgradeButton
                            className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-100"
                          >
                            Try Artist Pro
                          </ArtistProUpgradeButton>
                        </div>
                      )}
                    </div>

                  </div>
          </div>
        </div>
      </div>
    </div>
  );
}