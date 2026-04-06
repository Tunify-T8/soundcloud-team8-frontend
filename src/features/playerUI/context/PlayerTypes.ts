export interface TrackMeta {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl?: string;
  duration: number;
}

export interface PlayerContextValue {
  currentTrack: TrackMeta | null;
  setCurrentTrack: (track: TrackMeta) => void;
}