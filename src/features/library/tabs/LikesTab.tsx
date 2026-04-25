import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import TrackRow from "../components/TrackRow";
import { LIKED_TRACKS } from "../tests/mockdata";

const COLS = 6;

export default function LikesTab() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const totalSlots = Math.ceil(Math.max(LIKED_TRACKS.length, 1) / COLS) * COLS;

  return (
    <div data-testid="likes-tab">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-sm">Hear the tracks you've liked:</h2>
        <div className="flex items-center gap-3">
          <span className="text-zinc-400 text-xs">View</span>
          <button
            data-testid="likes-grid-view-btn"
            onClick={() => setView("grid")}
            className={`p-1.5 rounded ${view === "grid" ? "bg-orange-500" : "hover:bg-zinc-700"}`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
              <rect x="0" y="0" width="6" height="6" />
              <rect x="8" y="0" width="6" height="6" />
              <rect x="0" y="8" width="6" height="6" />
              <rect x="8" y="8" width="6" height="6" />
            </svg>
          </button>
          <button
            data-testid="likes-list-view-btn"
            onClick={() => setView("list")}
            className={`p-1.5 rounded ${view === "list" ? "bg-orange-500" : "hover:bg-zinc-700"}`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="#9ca3af">
              <rect x="0" y="1" width="14" height="2" />
              <rect x="0" y="6" width="14" height="2" />
              <rect x="0" y="11" width="14" height="2" />
            </svg>
          </button>
          <input
            data-testid="likes-filter-input"
            placeholder="Filter"
            className="bg-[#282828] border border-zinc-700 rounded-sm px-3 py-1 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 w-64"
          />
        </div>
      </div>

      {LIKED_TRACKS.length === 0 ? (
        <p data-testid="likes-empty-msg" className="text-white font-bold text-lg text-center py-20">
          You have not liked any tracks yet
        </p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-6 gap-4" data-testid="likes-grid">
          {Array.from({ length: totalSlots }).map((_, i) => {
            const track = LIKED_TRACKS[i];
            return track ? (
              <TrackRow key={track.id} track={track} view="grid" isLiked={true} />
            ) : (
              <div key={i} data-testid={`likes-slot-${i}`} className="w-full aspect-square rounded-sm bg-[#282828]" />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4" data-testid="likes-list">
          {LIKED_TRACKS.map((track) => (
            <TrackRow key={track.id} track={track} view="list" isLiked={true} />
          ))}
        </div>
      )}
    </div>
  );
}