import { createContext } from "react";
import type { PlayerContextValue } from "./PlayerTypes";

export const PlayerContext = createContext<PlayerContextValue>({
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  setCurrentTrack: () => {},
  setIsPlaying: () => {},
  setProgress: () => {},
});
