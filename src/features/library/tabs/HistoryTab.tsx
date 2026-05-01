import { useEffect, useRef, useState, useMemo } from "react";
import CollectionGrid from "../components/CollectionGrid";
import TrackRow from "../components/TrackRow";
import {
  clearListeningHistory,
  getListeningHistory,
  mapHistoryToTrackItem,
} from "../libraryService";
import type { TrackItem, CollectionItem } from "../types";
import { usePlayContext } from "@/hooks/usePlayContext";
import { useMe } from "@/features/profile/context/useMe";
const STORAGE_KEY = "recentlyPlayed";

function loadRecentlyPlayedFromStorage(): CollectionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const entries = JSON.parse(raw);
    return entries.map((entry: { id: string; title: string; artworkUrl?: string; entityType?: "track" | "playlist" | "album"; linkTo?: string }) => {
      const entityType = entry.entityType ?? "track";
      const fallbackLink =
        entityType === "playlist" || entityType === "album"
          ? `/collections/${entry.id}`
          : `/tracks/${entry.id}`;

      return {
        id: entry.id,
        title: entry.title,
        subtitle: "",
        coverUrl: entry.artworkUrl,
        entityType,
        linkTo: entry.linkTo ?? fallbackLink,
      };
    });
  } catch {
    return [];
  }
}

export default function HistoryTab() {
  const { me } = useMe();
  usePlayContext({ contextType: "history", contextId: me?.id ?? "" });
  const [recentlyPlayed] = useState<CollectionItem[]>(loadRecentlyPlayedFromStorage);
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [historyCleared, setHistoryCleared] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [query, setQuery] = useState("");
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchHistory() {
      try {
        setLoading(true);
        setError(null);
        const res = await getListeningHistory(1, 20);
        if (!cancelled) {
          const apiTracks = (res.data ?? []).map(mapHistoryToTrackItem);
          setTracks(apiTracks.length > 0 ? apiTracks : []);
        }
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load history");
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

  const filteredTracks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q)
    );
  }, [tracks, query]);

  async function handleClearHistory() {
    try {
      setIsClearing(true);
      setError(null);
      await clearListeningHistory();
      setTracks([]);
      setHistoryCleared(true);
      setShowPopup(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to clear listening history",
      );
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <div data-testid="history-tab">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-base">Recently played:</h2>
        {!historyCleared && (
          <div className="flex items-center gap-3">
            <div className="relative" ref={popupRef}>
              <button
                data-testid="history-clear-btn"
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
                      data-testid="history-clear-cancel"
                      onClick={() => setShowPopup(false)}
                      className="text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      data-testid="history-clear-confirm"
                      onClick={handleClearHistory}
                      disabled={isClearing}
                      className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full hover:bg-zinc-200 transition-colors"
                    >
                      {isClearing ? "Clearing..." : "Clear my history"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <input
              data-testid="history-filter-input"
              placeholder="Filter"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-[#282828] border border-zinc-700 rounded-sm px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 w-64"
            />
          </div>
        )}
      </div>

      {!historyCleared && recentlyPlayed.length > 0 && (
        <CollectionGrid items={recentlyPlayed} title="" hoverVariant="dim" />
      )}

      <h2 className="text-white font-bold text-base mt-8 mb-6">
        Hear the tracks you've played:
      </h2>

      {loading && (
        <div className="flex flex-col gap-4" data-testid="history-loading">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-sm bg-[#282828] animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <p data-testid="history-error" className="text-zinc-500 text-sm py-10 text-center">{error}</p>
      )}

      {!loading && !error && (tracks.length === 0 || historyCleared) && (
        <p data-testid="history-empty" className="text-white font-bold text-xl py-10 text-center">
          You have no listening history yet.
        </p>
      )}

      {!loading && !error && !historyCleared && filteredTracks.length === 0 && tracks.length > 0 && (
        <p data-testid="history-no-results" className="text-white font-bold text-lg text-center py-10">
          No tracks match your filter
        </p>
      )}

      {!loading && !error && !historyCleared && filteredTracks.length > 0 && (
        <div className="space-y-4">
          {filteredTracks.map((track) => (
            <TrackRow key={track.id} track={track} />
          ))}
        </div>
      )}
    </div>
  );
}
