import { useState } from "react";
import { Play, Lock, MoreVertical, Heart, MessageSquare, Repeat2, Download } from "lucide-react";
import type { Track } from "../types";

interface TrackCardProps {
  track: Track;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export default function TrackCard({ track, isSelected = false, onSelect }: TrackCardProps) {
  const [hovered, setHovered] = useState(false);

  const fmt = (val: number | null) => (val === null || val === 0 ? "-" : val.toString());

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 rounded transition-colors cursor-pointer
        ${hovered ? "bg-zinc-800" : "bg-zinc-900"}
        border border-transparent hover:border-zinc-700`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect?.(track.id)}
        className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-orange-500 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Thumbnail */}
      <div className="relative w-12 h-12 flex-shrink-0 bg-zinc-700 rounded flex items-center justify-center">
        {track.thumbnailUrl ? (
          <img
            src={track.thumbnailUrl}
            alt={track.title}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <Play className="w-5 h-5 text-white fill-white" />
        )}

        {track.isPrivate && (
          <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-0.5">
            <Lock className="w-3 h-3 text-zinc-400" />
          </div>
        )}
      </div>

      {/* Title + Artist */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-semibold truncate">
            {track.title}
          </span>

          {track.isHD && (
            <span className="text-xs font-bold text-white bg-zinc-600 px-1.5 py-0.5 rounded-sm leading-none">
              HD
            </span>
          )}
        </div>

        <p className="text-zinc-400 text-xs mt-0.5 truncate">
          {"USERNAME"}
        </p>
      </div>

      {/* Duration */}
      <div className="w-16 text-center">
        <span className="text-zinc-300 text-sm tabular-nums">
          {track.duration}
        </span>
      </div>

      {/* Date */}
      <div className="w-28 text-center">
        <span className="text-zinc-300 text-sm">
          {track.date}
        </span>
      </div>

      <div className="flex items-center gap-4 w-52 justify-center">
        <span className="flex items-center gap-1 text-zinc-500 text-xs">
          <Heart className="w-3.5 h-3.5" />
          {fmt(track.likes)}
        </span>

        <span className="flex items-center gap-1 text-zinc-500 text-xs">
          <MessageSquare className="w-3.5 h-3.5" />
          {fmt(track.comments)}
        </span>

        <span className="flex items-center gap-1 text-zinc-500 text-xs">
          <Repeat2 className="w-3.5 h-3.5" />
          {fmt(track.reposts)}
        </span>

        <span className="flex items-center gap-1 text-zinc-500 text-xs">
          <Download className="w-3.5 h-3.5" />
          {fmt(track.downloads)}
        </span>
      </div>

      <div className="w-16 text-right">
        <span className="text-white text-sm font-semibold tabular-nums">
          {track.plays}
        </span>
      </div>

      {/* More menu */}
      <button
        className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
  );
}