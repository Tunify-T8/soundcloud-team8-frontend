import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PlayerContext } from "./PlayerContext";
import type { TrackMeta, RecentlyPlayedEntry } from "./PlayerTypes";
import { playbackService } from "@/features/player-core/Playbackservice";
import { setQueue, setQueueLoading, setQueueError } from "@/store/queueSlice";
import { selectPlayContext } from "@/store/playContextSlice";
import { api } from "@/features/auth/services/api";

const RECENTLY_PLAYED_KEY = "recentlyPlayed";
const MAX_RECENTLY_PLAYED = 6;

function pushRecentlyPlayed(track: TrackMeta) {
  try {
    const raw = localStorage.getItem(RECENTLY_PLAYED_KEY);
    const existing: RecentlyPlayedEntry[] = raw ? JSON.parse(raw) : [];
    const entry: RecentlyPlayedEntry = {
      id: track.id,
      title: track.title,
      artworkUrl: track.artworkUrl ?? track.thumbnailUrl,
    };
    const filtered = existing.filter((t) => t.id !== entry.id);
    const updated = [entry, ...filtered].slice(0, MAX_RECENTLY_PLAYED);
    localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

async function fetchMyId(): Promise<string> {
  const { data } = await api.get<{ id: string }>("/users/me");
  return data.id;
}

function resolveContextId(contextType: string, contextId: string, myId: string): string {
  if (contextType === "feed" || contextType === "history") return myId;
  return contextId; // playlist/profile — set correctly by usePlayContext on that page
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const playContext = useSelector(selectPlayContext);

  const [currentTrack, setCurrentTrackState] = useState<TrackMeta | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pendingSeek, setPendingSeek] = useState<{ trackId: string; progress: number } | null>(null);

  const setCurrentTrack = async (track: TrackMeta) => {
    pushRecentlyPlayed(track);
    setCurrentTrackState(track);
    setProgress(0);

    const myId = await fetchMyId();
    const ctx = playContext ?? { contextType: "feed" as const, contextId: myId, shuffle: false, repeat: "none" as const };
    const contextId = resolveContextId(ctx.contextType, ctx.contextId, myId);

    dispatch(setQueueLoading());
    try {
      const response = await playbackService.buildQueue({
        contextType:  ctx.contextType,
        contextId,
        startTrackId: track.id,
        shuffle:      ctx.shuffle,
        repeat:       ctx.repeat,
      });
      dispatch(
        setQueue({
          tracks:        response.queue,
          currentIndex:  response.currentIndex,
          shuffle:       response.shuffle,
          repeat:        response.repeat,
          totalCount:    response.totalCount,
          activeContext: { contextType: ctx.contextType, contextId },
        })
      );
    } catch (err: unknown) {
      dispatch(setQueueError(err instanceof Error ? err.message : "Failed to load queue."));
    }
  };

  const requestSeek = (trackId: string, progress: number) => {
    setPendingSeek({ trackId, progress: Math.min(1, Math.max(0, progress)) });
  };

  const clearPendingSeek = () => setPendingSeek(null);

  return (
    <PlayerContext.Provider value={{ currentTrack, isPlaying, progress, pendingSeek, setCurrentTrack, setIsPlaying, setProgress, requestSeek, clearPendingSeek }}>
      {children}
    </PlayerContext.Provider>
  );
}