import { useState } from "react";
import { PlayerContext } from "./PlayerContext";
import type { TrackMeta } from "./PlayerTypes.ts";

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<TrackMeta | null>(null);

  return (
    <PlayerContext.Provider value={{ currentTrack, setCurrentTrack }}>
      {children}
    </PlayerContext.Provider>
  );
}