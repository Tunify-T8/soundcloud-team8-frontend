import { useState, useRef, useEffect } from "react";
import { Heart, UserPlus, MoreHorizontal, Repeat2, Share2, Link, ListEnd, ListPlus, Radio } from "lucide-react";

interface MediaCardProps {
  id: string;
  title: string;
  subtitle: string;
  coverUrl?: string | null;
  isLiked?: boolean;
  isPlaying?: boolean;
  onPlay?: () => void;
  onLike?: () => void;
  onFollow?: () => void;
  onClick?: () => void;
}

const MENU_ITEMS = [
  { label: "Repost", icon: Repeat2 },
  { label: "Share", icon: Share2 },
  { label: "Copy Link", icon: Link },
  { label: "Add to Next up", icon: ListEnd },
  { label: "Add to Playlist", icon: ListPlus },
  { label: "Station", icon: Radio },
];

export default function MediaCard({
  id,
  title,
  subtitle,
  coverUrl,
  isLiked = false,
  isPlaying = false,
  onPlay,
  onLike,
  onFollow,
  onClick,
}: MediaCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAbove, setMenuAbove] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  function handleMenuOpen(e: React.MouseEvent) {
    e.stopPropagation();
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setMenuAbove(spaceBelow < 220);
    }
    setMenuOpen((v) => !v);
  }

  return (
    <div
      data-testid={`media-card-${id}`}
      className="cursor-pointer group relative"
      onClick={onClick}
    >
      <div className="w-full aspect-square rounded-sm overflow-hidden mb-2 relative bg-[#282828] group-hover:bg-[#1a1a1a] transition-colors duration-300">
        {coverUrl && (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div
            data-testid={`media-card-play-${id}`}
            onClick={(e) => { e.stopPropagation(); onPlay?.(); }}
            className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl hover:scale-105 transition-transform"
          >
            {isPlaying ? (
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
          data-testid={`media-card-like-${id}`}
          onClick={(e) => { e.stopPropagation(); onLike?.(); }}
          className="hover:scale-110 transition-transform"
        >
          <Heart
            size={15}
            fill={isLiked ? "#ff5500" : "transparent"}
            color={isLiked ? "#ff5500" : "white"}
          />
        </button>

        <button
          data-testid={`media-card-follow-${id}`}
          onClick={(e) => { e.stopPropagation(); onFollow?.(); }}
          className="hover:scale-110 transition-transform"
        >
          <UserPlus size={15} color="white" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            ref={btnRef}
            data-testid={`media-card-menu-btn-${id}`}
            onClick={handleMenuOpen}
            className="hover:scale-110 transition-transform"
            title="More options"
          >
            <MoreHorizontal size={15} color="white" />
          </button>

          {menuOpen && (
            <div
              data-testid={`media-card-dropdown-${id}`}
              className={`absolute right-0 ${menuAbove ? "bottom-full mb-2" : "top-full mt-2"} w-52 bg-[#1a1a1a] border border-zinc-800 rounded shadow-2xl z-50 py-1`}
            >
              {MENU_ITEMS.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  data-testid={`media-card-menu-${label.toLowerCase().replace(/ /g, "-")}-${id}`}
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

      <p data-testid={`media-card-title-${id}`} className="text-white text-xs font-bold truncate">{title}</p>
      <p data-testid={`media-card-subtitle-${id}`} className="text-zinc-400 text-xs truncate">{subtitle}</p>
    </div>
  );
}