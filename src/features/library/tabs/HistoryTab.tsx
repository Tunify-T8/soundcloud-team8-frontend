import CollectionGrid from "../components/CollectionGrid";
import TrackRow from "../components/TrackRow";
import { RECENTLY_PLAYED, HISTORY_TRACKS } from "../tests/mockdata";

export default function HistoryTab() {
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

      {HISTORY_TRACKS.map((track) => (
        <TrackRow key={track.id} track={track} />
      ))}
    </div>
  );
}
