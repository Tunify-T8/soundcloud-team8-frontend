export interface TrackMeta {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl?: string;
  artworkUrl?: string;
  duration: number;
}

export interface PlayerContextValue {
  currentTrack: TrackMeta | null;
  isPlaying: boolean;
  progress: number;
  pendingSeek: { trackId: string; progress: number } | null;
  setCurrentTrack: (track: TrackMeta) => void;
  setIsPlaying: (v: boolean) => void;
  setProgress: (v: number) => void;
  requestSeek: (trackId: string, progress: number) => void;
  clearPendingSeek: () => void;
}

// Shape stored in localStorage for recently played entries
export interface RecentlyPlayedEntry {
  id: string;
  title: string;
  artworkUrl?: string;
}
