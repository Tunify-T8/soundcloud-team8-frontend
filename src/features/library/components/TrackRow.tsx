import { useState, useRef, useEffect } from "react";
import { Heart, UserPlus, MoreHorizontal, Repeat2, Share2, Link, ListEnd, ListPlus, Radio } from "lucide-react";
import SongCard from "@/components/ui/SongCard";
import type { TrackItem } from "../types";
import { usePlayer } from "@/features/playerUI/context/usePlayer";

interface TrackRowProps {
  track: TrackItem;
  view?: "grid" | "list";
  isLiked?: boolean;
  onUnlike?: (trackId: string) => Promise<void>;
}
  const MENU_ITEMS = [
  { label: "Repost", icon: Repeat2 },
  { label: "Share", icon: Share2 },
  { label: "Copy Link", icon: Link },
  { label: "Add to Next up", icon: ListEnd },
  { label: "Add to Playlist", icon: ListPlus },
  { label: "Station", icon: Radio },
];

export default function TrackRow({ track, view = "list", isLiked = false, onUnlike }: TrackRowProps) {
  const { currentTrack, isPlaying, setCurrentTrack, setIsPlaying } = usePlayer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAbove, setMenuAbove] = useState(false);
  const [unliking, setUnliking] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

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

  const handleUnlike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUnlike || unliking) return;
    setUnliking(true);
    try {
      await onUnlike(track.id);
    } finally {
      setUnliking(false);
    }
  };

  if (view === "grid") {
    return (
      <div
        data-testid={`track-row-grid-${track.id}`}
        className="cursor-pointer group relative"
        onClick={handlePlayToggle}
      >
        <div className="w-full aspect-square rounded-sm overflow-hidden mb-2 relative bg-[#282828] group-hover:bg-[#1a1a1a] transition-colors duration-300">
          {track.coverUrl && (
            <img
              src={track.coverUrl}
              alt={track.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}

          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm" />

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
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-end gap-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <button
            data-testid={`track-like-btn-${track.id}`}
            onClick={handleUnlike}
            disabled={unliking}
            className="hover:scale-110 transition-transform disabled:opacity-50"
          >
            <Heart
              size={15}
              fill={isLiked ? "#ff5500" : "transparent"}
              color={isLiked ? "#ff5500" : "white"}
            />
          </button>

          <button
            data-testid={`track-follow-btn-${track.id}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:scale-110 transition-transform"
          >
            <UserPlus size={15} color="white" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              ref={btnRef}
              data-testid={`track-menu-btn-${track.id}`}
              title="More"
              onClick={(e) => {
                e.stopPropagation();
                if (btnRef.current) {
                  const rect = btnRef.current.getBoundingClientRect();
                  setMenuAbove(window.innerHeight - rect.bottom < 220);
                }
                setMenuOpen((v) => !v);
              }}
              className="hover:scale-110 transition-transform"
            >
              <MoreHorizontal size={15} color="white" />
            </button>

            {menuOpen && (
              <div
                data-testid={`track-dropdown-${track.id}`}
                className={`absolute right-0 ${menuAbove ? "bottom-full mb-2" : "top-full mt-2"} w-52 bg-[#1a1a1a] border border-zinc-800 rounded shadow-2xl z-50 py-1`}
              >
                {MENU_ITEMS.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    data-testid={`track-menu-${label.toLowerCase().replace(/ /g, "-")}-${track.id}`}
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-zinc-800 transition-colors"
                  >
                    <Icon size={15} className="text-zinc-400 shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            )}
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