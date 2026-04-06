import { createContext } from "react";
import type { PlayerContextValue } from "./PlayerTypes.ts";

export const PlayerContext = createContext<PlayerContextValue>({
  currentTrack: null,
  setCurrentTrack: () => {},
});