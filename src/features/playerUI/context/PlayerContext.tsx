import { useState } from "react";
import type { ReactNode } from "react";
import { PlayerContext } from "./playContext";
import type { Track } from "../../../shared/types/Track";

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <PlayerContext.Provider value={{ currentTrack, isPlaying, progress, setCurrentTrack, setIsPlaying, setProgress }}>
      {children}
    </PlayerContext.Provider>
  );
}