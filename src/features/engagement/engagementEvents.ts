export const TRACK_LIKE_CHANGED_EVENT = "track-like-changed";

export interface TrackLikeChangedDetail {
  trackId: string;
  isLiked: boolean;
  likesCount?: number;
}

export function notifyTrackLikeChanged(detail: TrackLikeChangedDetail) {
  window.dispatchEvent(
    new CustomEvent<TrackLikeChangedDetail>(TRACK_LIKE_CHANGED_EVENT, {
      detail,
    }),
  );
}

