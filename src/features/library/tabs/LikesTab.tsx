import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import TrackRow from "../components/TrackRow";
import { LIKED_TRACKS } from "../tests/mockdata";

const COLS = 6;

export default function LikesTab() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const totalSlots = Math.ceil(Math.max(LIKED_TRACKS.length, 1) / COLS) * COLS;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-sm">Hear the tracks you've liked:</h2>
        <div className="flex items-center gap-3">
          <span className="text-zinc-400 text-xs">View</span>
          <button
            onClick={() => setView("grid")}
            className={`p-1.5 rounded ${view === "grid" ? "bg-orange-500" : "hover:bg-zinc-700"}`}
          >
            <LayoutGrid size={14} color="white" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded ${view === "list" ? "bg-orange-500" : "hover:bg-zinc-700"}`}
          >
            <List size={14} color="#9ca3af" />
          </button>
          <input
            placeholder="Filter"
            className="bg-[#282828] border border-zinc-700 rounded-sm px-3 py-1 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 w-64"
          />
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: totalSlots }).map((_, i) => {
            const track = LIKED_TRACKS[i];
            return track ? (
              <TrackRow key={track.id} track={track} view="grid" />
            ) : (
              <div key={i} className="w-full aspect-square rounded-sm bg-[#282828]" />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {LIKED_TRACKS.map((track) => (
            <TrackRow key={track.id} track={track} view="list" />
          ))}
        </div>
      )}
    </div>
  );
}
