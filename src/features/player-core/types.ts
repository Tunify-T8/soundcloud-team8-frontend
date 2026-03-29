export type playabilityStatus = "playable" | "preview" | "blocked";
export type playbackAction = "play" | "pause" | "seek" | "complete" | "heartbeat";
export type streamQuality = "auto" | "low" | "medium" | "high";

export interface playbackBundle {
  trackId: string;
  title: string;
  artist: {
    id: string;
    name: string;
    tier: string;
  };
  durationSeconds: number;
  waveformUrl: string;
  coverUrl: string;
  contentWarning: boolean;
  engagement: {
    likeCount: number;
    commentCount: number;
    repostCount: number;
    isLiked: boolean;
    isReposted: boolean;
    isSaved: boolean;
  };
  playability: {
    status: playabilityStatus;
    regionBlocked: boolean;
    tierBlocked: boolean;
    requiresSubscription: boolean;
    blockedReason: string | null;
  };
  preview: {
    enabled: boolean;
    previewDurationSeconds: number;
    previewStartSeconds: number;
  };
  scheduledReleaseDate: string | null;
}

export interface streamBundle {
  trackId: string;
  stream: {
    url: string;
    expiresInSeconds: number;
    format: "hls" | "mp3";
  };
}

export interface playbackEventPayload {
  trackId: string;
  action: playbackAction;
  positionSeconds: number;
}