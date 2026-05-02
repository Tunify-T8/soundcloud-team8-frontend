export interface TrackMeta {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl?: string;
  artworkUrl?: string;
  duration: number;
  recentlyPlayedTitle?: string;
  recentlyPlayedArtworkUrl?: string;
  recentlyPlayedEntityType?: "track" | "playlist" | "album";
  recentlyPlayedLinkTo?: string;
  privateToken?: string;
  /**
   * When set, the player skips the stream API and plays this
   * blob URL directly. Used for downloaded/offline tracks.
   */
  offlineSrc?: string;
}

export interface PlayerContextValue {
  currentTrack: TrackMeta | null;
  isPlaying: boolean;
  progress: number;
  pendingSeek: { trackId: string; progress: number } | null;
  setCurrentTrack: (track: TrackMeta) => void;
  syncCurrentTrack: (track: TrackMeta) => void;
  setIsPlaying: (v: boolean) => void;
  setProgress: (v: number) => void;
  requestSeek: (trackId: string, progress: number) => void;
  clearPendingSeek: () => void;
}

export interface RecentlyPlayedEntry {
  id: string;
  title: string;
  artworkUrl?: string;
  entityType?: "track" | "playlist" | "album";
  linkTo?: string;
}
