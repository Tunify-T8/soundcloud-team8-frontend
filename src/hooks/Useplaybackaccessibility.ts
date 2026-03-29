import type { playbackBundle, accessibilityState } from "../features/player-core/types";

// ─── Reason → message map ─────────────────────────────────────────────────────

const blockedReasonMessages: Record<string, string> = {
  regionRestricted: "This track is not available in your region.",
  tierRestricted:   "Upgrade your plan to listen to this track.",
  explicitContent:  "This track contains explicit content.",
  scheduled:        "This track hasn't been released yet.",
  default:          "This track is not available.",
};

function resolveBlockedMessage(bundle: playbackBundle): string | null {
  const { playability, scheduledReleaseDate } = bundle;

  if (playability.status === "playable") return null;

  if (scheduledReleaseDate && new Date(scheduledReleaseDate) > new Date()) {
    const releaseDate = new Date(scheduledReleaseDate).toLocaleDateString(
      undefined,
      { year: "numeric", month: "long", day: "numeric" }
    );
    return `This track releases on ${releaseDate}.`;
  }

  if (playability.blockedReason) {
    return (
      blockedReasonMessages[playability.blockedReason] ??
      blockedReasonMessages.default
    );
  }

  if (playability.regionBlocked) return blockedReasonMessages.regionRestricted;
  if (playability.tierBlocked)   return blockedReasonMessages.tierRestricted;

  return blockedReasonMessages.default;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePlaybackAccessibility(
  bundle: playbackBundle | null
): accessibilityState {
  if (!bundle) {
    return {
      status:                "blocked",
      isPlayable:            false,
      isPreview:             false,
      isBlocked:             true,
      previewDurationSeconds: 0,
      previewStartSeconds:   0,
      blockedMessage:        null,
      requiresSubscription:  false,
    };
  }

  const { playability, preview } = bundle;
  const status = playability.status;

  return {
    status,
    isPlayable:            status === "playable",
    isPreview:             status === "preview",
    isBlocked:             status === "blocked",
    previewDurationSeconds: status === "preview" && preview.enabled
                             ? preview.previewDurationSeconds
                             : 0,
    previewStartSeconds:   status === "preview" && preview.enabled
                             ? preview.previewStartSeconds
                             : 0,
    blockedMessage:        resolveBlockedMessage(bundle),
    requiresSubscription:  playability.requiresSubscription,
  };
}