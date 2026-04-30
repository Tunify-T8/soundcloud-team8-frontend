import { useState } from "react";
import { PlayerContext } from "./PlayerContext";
import type { TrackMeta, RecentlyPlayedEntry } from "./PlayerTypes";

const RECENTLY_PLAYED_KEY = "recentlyPlayed";
const MAX_RECENTLY_PLAYED = 6;

function pushRecentlyPlayed(track: TrackMeta) {
  try {
    const raw = localStorage.getItem(RECENTLY_PLAYED_KEY);
    const existing: RecentlyPlayedEntry[] = raw ? JSON.parse(raw) : [];

    const entry: RecentlyPlayedEntry = {
      id: track.id,
      title: track.recentlyPlayedTitle ?? track.title,
      artworkUrl: track.recentlyPlayedArtworkUrl ?? track.artworkUrl ?? track.thumbnailUrl,
      entityType: track.recentlyPlayedEntityType ?? "track",
      linkTo: track.recentlyPlayedLinkTo ?? `/tracks/${track.id}`,
    };

    // Remove any existing entry for this track so it moves to the front
    const filtered = existing.filter((t) => t.id !== entry.id);

    // Prepend the new entry and cap at max
    const updated = [entry, ...filtered].slice(0, MAX_RECENTLY_PLAYED);

    localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrackState] = useState<TrackMeta | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pendingSeek, setPendingSeek] = useState<{ trackId: string; progress: number } | null>(null);

  const setCurrentTrack = (track: TrackMeta) => {
    pushRecentlyPlayed(track);
    setCurrentTrackState(track);
    setProgress(0);
  };

  const requestSeek = (trackId: string, progress: number) => {
    setPendingSeek({
      trackId,
      progress: Math.min(1, Math.max(0, progress)),
    });
  };

  const clearPendingSeek = () => {
    setPendingSeek(null);
  };

  return (
    <PlayerContext.Provider value={{ currentTrack, isPlaying, progress, pendingSeek, setCurrentTrack, setIsPlaying, setProgress, requestSeek, clearPendingSeek }}>
      {children}
    </PlayerContext.Provider>
  );
}
