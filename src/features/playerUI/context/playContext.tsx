import { createContext } from "react";
import type { Track } from "../../../shared/types/Track";

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  setCurrentTrack: (track: Track) => void;
  setIsPlaying: (v: boolean) => void;
  setProgress: (v: number) => void;
}

export type { Track, PlayerContextType };
export const PlayerContext = createContext<PlayerContextType | null>(null);