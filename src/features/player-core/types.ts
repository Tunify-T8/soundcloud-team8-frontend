
export type playabilityStatus = "playable" | "preview" | "blocked";
export type playbackAction    = "play" | "pause" | "seek" | "complete" | "heartbeat";
export type streamQuality     = "auto" | "low" | "medium" | "high";
export type playerStatus      =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "blocked"
  | "preview"
  | "error";


export interface playbackArtist {
  id:   string;
  name: string;
  tier: string;
}

export interface playbackEngagement {
  likeCount:    number;
  commentCount: number;
  repostCount:  number;
  isLiked:      boolean;
  isReposted:   boolean;
  isSaved:      boolean;
}

export interface playbackPlayability {
  status:               playabilityStatus;
  regionBlocked:        boolean;
  tierBlocked:          boolean;
  requiresSubscription: boolean;
  blockedReason:        string | null;
}

export interface playbackPreview {
  enabled:               boolean;
  previewDurationSeconds: number;
  previewStartSeconds:   number;
}

export interface playbackBundle {
  trackId:              string;
  title:                string;
  artist:               playbackArtist;
  durationSeconds:      number;
  waveformUrl:          string;
  coverUrl:             string;
  contentWarning:       boolean;
  engagement:           playbackEngagement;
  playability:          playbackPlayability;
  preview:              playbackPreview;
  scheduledReleaseDate: string | null;
}

export interface streamBundle {
  trackId: string;
  stream: {
    url:              string;
    expiresInSeconds: number;
    format:           "hls" | "mp3";
  };
}

export interface playbackEventPayload {
  trackId:         string;
  action:          playbackAction;
  positionSeconds: number;
}

// ─── Hook Types ───────────────────────────────────────────────────────────────

export interface accessibilityState {
  status:                playabilityStatus;
  isPlayable:            boolean;
  isPreview:             boolean;
  isBlocked:             boolean;
  previewDurationSeconds: number;
  previewStartSeconds:   number;
  blockedMessage:        string | null;
  requiresSubscription:  boolean;
}

export interface usePlaybackOptions {
  trackId:      string | null;
  privateToken?: string;
  quality?:     streamQuality;
  autoPlay?:    boolean;
}

export interface usePlaybackReturn {
  status:                  playerStatus;
  bundle:                  playbackBundle | null;
  error:                   string | null;
  currentTime:             number;
  duration:                number;
  volume:                  number;
  isMuted:                 boolean;
  buffered:                number;
  previewSecondsRemaining: number | null;
  play:                    () => void;
  pause:                   () => void;
  seek:                    (seconds: number) => void;
  setVolume:               (volume: number) => void;
  toggleMute:              () => void;
  audioRef:                React.RefObject<HTMLAudioElement | null>;
}