import { useState } from "react";
import TrackCard from "./TrackCard";
import EditTrackDrawer from "./EditTrackDrawer";
import type { Track } from "../../../shared/types/Track";
import { Pencil, PlusSquare } from "lucide-react";

interface TrackListProps {
  tracks: Track[];
  onDelete: (id: string) => void;
  onUpdate: (updatedTrack: Track) => void;
}

export default function TrackList({ tracks, onDelete, onUpdate }: TrackListProps) {
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);

  const validTracks = tracks.filter((track) => track != null && track.id != null);
  const allSelected = selectedTracks.length === validTracks.length && validTracks.length > 0;
  const someSelected = selectedTracks.length > 0;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedTracks([]);
    } else {
      setSelectedTracks(validTracks.map((t) => t.id));
    }
  };

  const handleSelectTrack = (id: string) => {
    setSelectedTracks((prev) =>
      prev.includes(id) ? prev.filter((trackId) => trackId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-0 overflow-visible">
      <div className="space-y-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-[hsl(0,0%,10%)]">

          {/* Checkbox */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleSelectAll}
              className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-colors
                ${someSelected
                  ? "bg-white border-white"
                  : "bg-transparent border-zinc-500 hover:border-white"
                }`}
            >
              {someSelected && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>

          {/* Label */}
          {someSelected ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-white text-xs font-bold tracking-wide">
                {selectedTracks.length} SELECTED
              </span>
              <button className="text-zinc-400 hover:text-white transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              <button className="text-zinc-400 hover:text-white transition-colors">
                <PlusSquare className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-foreground text-xs font-bold tracking-wide flex-1 min-w-0">TRACKS</span>
          )}

          {/* Duration — hidden on mobile */}
          <div className="hidden sm:block w-16 text-center flex-shrink-0">
            <span className="text-foreground text-xs font-bold">DURATION</span>
          </div>

          {/* Date — hidden on mobile */}
          <div className="hidden md:block w-28 text-center flex-shrink-0">
            <span className="text-foreground text-xs font-bold">DATE</span>
          </div>

          {/* Engagements — hidden on mobile */}
          <div className="hidden lg:flex items-center w-48 justify-center flex-shrink-0">
            <span className="text-foreground text-xs font-bold">ENGAGEMENTS</span>
          </div>

          {/* Plays */}
          <div className="w-12 sm:w-16 text-right flex-shrink-0">
            <span className="text-foreground text-xs font-bold">PLAYS</span>
          </div>

          {/* Spacers for Amplify + menu */}
          <div className="hidden sm:block w-[88px] flex-shrink-0" />
          <div className="w-6 flex-shrink-0" />
        </div>

        <div className="space-y-1 overflow-visible">
          <div className="space-y-1">
            {validTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isSelected={selectedTracks.includes(track.id)}
                onSelect={handleSelectTrack}
                onEdit={(id) => {
                  const found = tracks.find((t) => t.id === id) ?? null;
                  setEditingTrack(found);
                }}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      </div>

      {editingTrack && (
        <EditTrackDrawer
          track={editingTrack}
          onClose={() => setEditingTrack(null)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}