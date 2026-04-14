import { useEffect, useRef, useState } from "react";
import CollectionGrid from "../components/CollectionGrid";
import TrackRow from "../components/TrackRow";
import {
  getListeningHistory,
  mapHistoryToTrackItem,
} from "../libraryService";
import type { TrackItem } from "../types";
import type { CollectionItem } from "../types";

const STORAGE_KEY = "recentlyPlayed"; // must match the key used when saving

function loadRecentlyPlayedFromStorage(): CollectionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const entries = JSON.parse(raw);
    // Map RecentlyPlayedEntry → CollectionItem, fixing artworkUrl → coverUrl
    return entries.map((entry: { id: string; title: string; artworkUrl?: string }) => ({
      id: entry.id,
      title: entry.title,
      subtitle: "",
      coverUrl: entry.artworkUrl,  // ← this is the artwork fix
    }));
  } catch {
    return [];
  }
}

export default function HistoryTab() {
  const [recentlyPlayed] = useState<CollectionItem[]>(loadRecentlyPlayedFromStorage);
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [historyCleared, setHistoryCleared] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchHistory() {
      try {
        setLoading(true);
        setError(null);
        const res = await getListeningHistory(1, 20);
        if (!cancelled) {
          setTracks((res.data ?? []).map(mapHistoryToTrackItem));
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load history");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchHistory();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowPopup(false);
      }
    }
    if (showPopup) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPopup]);

  function handleClearHistory() {
    setTracks([]);
    setHistoryCleared(true);
    setShowPopup(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-base">Recently played:</h2>

        {!historyCleared && (
          <div className="flex items-center gap-3">
            <div className="relative" ref={popupRef}>
              <button
                onClick={() => setShowPopup((v) => !v)}
                className="text-xs text-zinc-400 hover:text-white transition-colors font-semibold"
              >
                Clear all history
              </button>

              {showPopup && (
                <div className="absolute right-0 top-full mt-2 w-[240px] bg-[#282828] rounded-md px-3 py-3 z-50 shadow-xl">
                  <div className="absolute -top-1.5 right-3 w-3 h-3 bg-[#282828] rotate-45" />
                  <p className="text-white text-xs leading-snug mb-3">
                    Are you sure you want to clear your entire listening history? You won't be able to undo this action.
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setShowPopup(false)}
                      className="text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearHistory}
                      className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full hover:bg-zinc-200 transition-colors"
                    >
                      Clear my history
                    </button>
                  </div>
                </div>
              )}
            </div>

            <input
              placeholder="Filter"
              className="bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-1 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 w-36"
            />
          </div>
        )}
      </div>

      {/* Recently played grid — now from localStorage */}
      {!historyCleared && recentlyPlayed.length > 0 && (
        <CollectionGrid items={recentlyPlayed} title="" />
      )}

      <h2 className="text-white font-bold text-base mt-8 mb-6">
        Hear the tracks you've played:
      </h2>

      {loading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-sm bg-[#282828] animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-zinc-500 text-sm py-10 text-center">{error}</p>
      )}

      {!loading && !error && (tracks.length === 0 || historyCleared) && (
        <p className="text-white font-bold text-xl py-10 text-center">
          You have no listening history yet.
        </p>
      )}

      {!loading && !error && !historyCleared && tracks.map((track) => (
        <TrackRow key={track.id} track={track} />
      ))}
    </div>
  );
}