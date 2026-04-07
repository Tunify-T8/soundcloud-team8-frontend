export interface TrackMeta {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl?: string;
  duration: number;
}

export interface PlayerContextValue {
  currentTrack: TrackMeta | null;
  isPlaying: boolean;
  setCurrentTrack: (track: TrackMeta) => void;
  setIsPlaying: (v: boolean) => void;
}