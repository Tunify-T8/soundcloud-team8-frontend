import { useEffect, useState } from "react";
import CollectionGrid from "../components/CollectionGrid";
import TrackRow from "../components/TrackRow";
import { RECENTLY_PLAYED } from "../tests/mockdata";
import {
  getListeningHistory,
  mapHistoryToTrackItem,
} from "../libraryService";
import type { TrackItem } from "../types";

export default function HistoryTab() {
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div>
      <CollectionGrid items={RECENTLY_PLAYED} title="Recently played:" />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-base">Hear the tracks you've played:</h2>
        <div className="flex items-center gap-3">
          <button className="text-xs text-zinc-400 hover:text-white transition-colors">
            Clear all history
          </button>
          <input
            placeholder="Filter"
            className="bg-transparent border border-zinc-700 rounded-sm px-3 py-1 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>
      </div>

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

      {!loading && !error && tracks.length === 0 && (
        <p className="text-zinc-500 text-sm py-10 text-center">No listening history yet.</p>
      )}

      {!loading && !error && tracks.map((track) => (
        <TrackRow key={track.id} track={track} />
      ))}
    </div>
  );
}
