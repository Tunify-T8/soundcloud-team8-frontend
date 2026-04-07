import { useState } from "react";
import { PlayerContext } from "./PlayerContext";
import type { TrackMeta } from "./PlayerTypes";

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<TrackMeta | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <PlayerContext.Provider value={{ currentTrack, isPlaying, setCurrentTrack, setIsPlaying }}>
      {children}
    </PlayerContext.Provider>
  );
}