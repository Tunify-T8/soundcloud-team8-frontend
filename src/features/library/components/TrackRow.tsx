import SongCard from "@/components/ui/SongCard";
import { Heart } from "lucide-react";
import type { TrackItem } from "../types";

interface TrackRowProps {
  track: TrackItem;
  view?: "grid" | "list";
}

export default function TrackRow({ track, view = "list" }: TrackRowProps) {
  if (view === "grid") {
    return (
      <div className="cursor-pointer group">
        <div className="w-full aspect-square rounded-sm overflow-hidden mb-2 relative bg-[#282828]">
          {track.coverUrl && (
            <img
              src={track.coverUrl}
              alt={track.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* White play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="black">
                <polygon points="2,0 16,7 2,14" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 mb-0.5">
          <Heart size={11} fill="#ff5500" color="#ff5500" />
          <p className="text-white text-xs font-bold truncate">{track.title}</p>
        </div>
        <p className="text-zinc-400 text-xs truncate">{track.artist}</p>
      </div>
    );
  }

  return (
    <SongCard
      artistName={track.artist}
      title={track.title}
      coverUrl={track.coverUrl}
      timeAgo={track.timeAgo}
      likes={track.likes}
      reposts={track.reposts}
      plays={track.plays}
      comments={track.comments}
    />
  );
}
