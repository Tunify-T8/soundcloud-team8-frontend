// ─── Enums / Unions ───────────────────────────────────────────────────────────

export type playabilityStatus = "playable" | "preview" | "blocked";
export type streamQuality     = "auto" | "low" | "medium" | "high";
export type repeatMode        = "none" | "one" | "all";
// "feed" added alongside the original three
export type contextType       = "playlist" | "profile" | "history" | "feed";
export type playerStatus      =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "blocked"
  | "preview"
  | "error";

// ─── Service Types ────────────────────────────────────────────────────────────

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
  enabled:                boolean;
  previewDurationSeconds: number;
  previewStartSeconds:    number;
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

// ─── Queue Types ──────────────────────────────────────────────────────────────

export interface queueTrack {
  trackId:         string;
  title:           string;
  artist:          string;
  durationSeconds: number;
}

export interface buildQueueParams {
  contextType:   contextType;
  contextId:     string;
  startTrackId?: string;
  shuffle?:      boolean;
  repeat?:       repeatMode;
}

export interface queueResponse {
  queue:        queueTrack[];
  currentIndex: number;
  shuffle:      boolean;
  repeat:       repeatMode;
  totalCount:   number;
}

/**
 * Snapshot of the context that built the current queue.
 * Stored in queueSlice so components can read "what context is active"
 * without importing playContextSlice.
 */
export interface activeQueueContext {
  contextType: contextType;
  contextId:   string;
}

export interface queueState {
  tracks:         queueTrack[];
  currentIndex:   number;
  shuffle:        boolean;
  repeat:         repeatMode;
  isLoading:      boolean;
  error:          string | null;
  totalCount:     number;
  /** The context that built this queue — null until first loadQueue call. */
  activeContext:  activeQueueContext | null;
}

export interface useQueueReturn {
  tracks:         queueTrack[];
  currentIndex:   number;
  currentTrackId: string | null;
  currentTrack:   queueTrack | null;
  shuffle:        boolean;
  repeat:         repeatMode;
  isLoading:      boolean;
  error:          string | null;
  totalCount:     number;
  hasNext:        boolean;
  hasPrev:        boolean;
  activeContext:  activeQueueContext | null;
  loadQueue:      (params: buildQueueParams) => Promise<void>;
  /**
   * Smart play: reads the active PlayContext from Redux, builds the queue
   * starting at the given track, then marks that track as playing.
   * Call this instead of loadQueue when the user clicks play on a track.
   */
  playTrack:      (trackId: string) => Promise<void>;
  next:           () => void;
  prev:           () => void;
  addTrack:       (track: queueTrack, atIndex?: number) => void;
  removeTrack:    (trackId: string) => void;
  jumpTo:         (index: number) => void;
  toggleShuffle:  () => void;
  toggleRepeat:   () => void;
  clearQueue:     () => void;
}

// ─── Hook Types ───────────────────────────────────────────────────────────────

export interface accessibilityState {
  status:                 playabilityStatus;
  isPlayable:             boolean;
  isPreview:              boolean;
  isBlocked:              boolean;
  previewDurationSeconds: number;
  previewStartSeconds:    number;
  blockedMessage:         string | null;
  requiresSubscription:   boolean;
}

export interface usePlaybackOptions {
  trackId:       string | null;
  privateToken?: string;
  autoPlay?:     boolean;
  offlineSrc?:   string;
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