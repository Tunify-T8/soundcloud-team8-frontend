import { useState, useRef, useEffect } from "react";
import { Heart, UserPlus, AlignJustify } from "lucide-react";
import SongCard from "@/components/ui/SongCard";
import type { TrackItem } from "../types";
import { usePlayer } from "@/features/playerUI/context/usePlayer";

interface TrackRowProps {
  track: TrackItem;
  view?: "grid" | "list";
  isLiked?: boolean;
}

export default function TrackRow({ track, view = "list", isLiked = false }: TrackRowProps) {
  const { currentTrack, isPlaying, setCurrentTrack, setIsPlaying } = usePlayer();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isThisTrack = currentTrack?.id === track.id;
  const playing = isThisTrack && isPlaying;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

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
      <div
        data-testid={`track-row-grid-${track.id}`}
        className="cursor-pointer group relative"
        onClick={handlePlayToggle}
      >
        <div className="w-full aspect-square rounded-sm overflow-hidden mb-2 relative bg-[#282828]">
          {track.coverUrl && (
            <img
              src={track.coverUrl}
              alt={track.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl">
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

          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 pb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">            <button
              data-testid={`track-like-btn-${track.id}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:scale-110 transition-transform"
            >
              <Heart
                size={15}
                fill={isLiked ? "#ff5500" : "transparent"}
                color={isLiked ? "#ff5500" : "white"}
              />
            </button>

            <div className="flex items-center gap-2">
              <button
                data-testid={`track-follow-btn-${track.id}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:scale-110 transition-transform"
              >
                <UserPlus size={15} color="white" />
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  data-testid={`track-menu-btn-${track.id}`}
                  onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                  className="hover:scale-110 transition-transform"
                >
                  <AlignJustify size={15} color="white" />
                </button>

                {menuOpen && (
                  <div
                    data-testid={`track-dropdown-${track.id}`}
                    className="absolute bottom-full right-0 mb-2 w-44 bg-[#1a1a1a] border border-zinc-800 rounded shadow-xl z-50 py-1"
                  >
                    {["Repost", "Share", "Copy Link", "Add to Next up", "Add to Playlist", "Station"].map((item) => (
                      <button
                        key={item}
                        data-testid={`track-menu-${item.toLowerCase().replace(/ /g, "-")}-${track.id}`}
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-800 transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <p data-testid={`track-title-${track.id}`} className="text-white text-xs font-bold truncate">{track.title}</p>
        <p data-testid={`track-artist-${track.id}`} className="text-zinc-400 text-xs truncate">{track.artist}</p>
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