import SongCard from "@/components/ui/SongCard";
import { Heart } from "lucide-react";
import type { TrackItem } from "../types";
import { usePlayer } from "@/features/playerUI/context/usePlayer";

interface TrackRowProps {
  track: TrackItem;
  view?: "grid" | "list";
}

export default function TrackRow({ track, view = "list" }: TrackRowProps) {
  const { currentTrack, isPlaying, setCurrentTrack, setIsPlaying } = usePlayer();

  const isThisTrack = currentTrack?.id === track.id;
  const playing = isThisTrack && isPlaying;

  const handlePlayToggle = () => {
    if (!track.id) return;
    if (isThisTrack) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack({
        id: track.id,
        title: track.title,
        artist: track.artist,
        thumbnailUrl: track.coverUrl || undefined,
        duration: 0,
      });
      setIsPlaying(true);
    }
  };

  if (view === "grid") {
    return (
      <div className="cursor-pointer group" onClick={handlePlayToggle}>
        <div className="w-full aspect-square rounded-sm overflow-hidden mb-2 relative bg-[#282828]">
          {track.coverUrl && (
            <img
              src={track.coverUrl}
              alt={track.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          {/* Dark haze overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Large play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl">
              {playing ? (
                <svg width="18" height="18" viewBox="0 0 14 14" fill="black">
                  <rect x="1" y="1" width="4" height="12" />
                  <rect x="9" y="1" width="4" height="12" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 14 14" fill="black">
                  <polygon points="3,1 13,7 3,13" />
                </svg>
              )}
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
      trackId={track.id}
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