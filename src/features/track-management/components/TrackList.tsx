import { useState } from "react";
import TrackCard from "./TrackCard";
import type { Track } from "../../../shared/types/Track";

interface TrackListProps {
  tracks: Track[];
}

export default function TrackList({ tracks }: TrackListProps) {
  const [allSelected, setAllSelected] = useState(false);

  const handleSelectAll = () => {
    setAllSelected(!allSelected);
    // Handle select all logic here
  };
  
  const [selectedTracks, setSelectedTracks] = useState<string[]>([])

  const handleSelectTrack = (id: string) => {
    setSelectedTracks(prev => 
      prev.includes(id) 
        ? prev.filter(trackId => trackId !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-[hsl(0,0%,10%)]">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={allSelected}
          onChange={handleSelectAll}
          className="w-4 h-4 rounded border-border bg-muted accent-orange-500 flex-shrink-0"
        />

        {/* Tracks Label */}
        <span className="text-foreground text-xs font-bold tracking-wide flex-1">TRACKS</span>

        {/* Duration Header */}
        <div className="w-16 text-center">
          <span className="text-foreground text-xs font-bold">DURATION</span>
        </div>

        {/* Date Header */}
        <div className="w-28 text-center">
          <span className="text-foreground text-xs font-bold">DATE</span>
        </div>

        {/* Engagements Header */}
        <div className="flex items-center gap-4 w-52 justify-center">
          <span className="text-foreground text-xs font-bold">ENGAGEMENTS</span>
        </div>

        {/* Plays Header */}
        <div className="w-16 text-right">
          <span className="text-foreground text-xs font-bold">PLAYS</span>
        </div>

        {/* More menu spacer */}
        <div className="w-6"></div>
      </div>

      {/* Track Rows */}
      <div className="space-y-1">
        {tracks.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            isSelected={selectedTracks.includes(track.id)}
            onSelect={handleSelectTrack}
          />
        ))}
      </div>
    </div>
  );
}