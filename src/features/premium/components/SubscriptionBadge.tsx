import { Plus, Star } from "lucide-react";
import type { SubscriptionTier } from "@/features/premium/types";

interface SubscriptionBadgeProps {
  tier: SubscriptionTier;
  size?: number;
  className?: string;
}

const SCALLOP_POINTS =
  "32,2 39,5 46,3 51,9 58,10 61,17 62,24 60,32 62,40 61,47 58,54 51,55 46,61 39,59 32,62 25,59 18,61 13,55 6,54 3,47 2,40 4,32 2,24 3,17 6,10 13,9 18,3 25,5";

export default function SubscriptionBadge({
  tier,
  size = 28,
  className = "",
}: SubscriptionBadgeProps) {
  if (tier === "free") {
    return null;
  }

  if (tier === "artist-pro") {
    return (
      <div
        className={`relative inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        aria-label="Artist Pro badge"
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          className="absolute inset-0"
          aria-hidden="true"
        >
          <polygon points={SCALLOP_POINTS} fill="#d4b253" />
          <circle cx="32" cy="32" r="19" fill="#d4b253" />
        </svg>
        <Star
          size={size * 0.48}
          fill="white"
          color="white"
          strokeWidth={1.8}
          className="relative z-[1]"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-[#6d5cf6] ${className}`}
      style={{ width: size, height: size }}
      aria-label="Artist badge"
    >
      <Plus size={size * 0.58} color="white" strokeWidth={3.2} />
    </div>
  );
}
