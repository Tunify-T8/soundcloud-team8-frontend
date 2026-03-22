import { useState, useRef, useEffect } from "react";
import {
  Play, Lock, MoreVertical, Heart, MessageSquare, Repeat2,
  Download, Pencil, ListPlus, CircleDollarSign, SlidersHorizontal,
  Share2, TrendingUp, Link, Trash2
} from "lucide-react";
import type { Track } from "@/shared/types/Track";

interface TrackCardProps {
  track: Track;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
  onAddToPlaylist?: (id: string) => void;
  onMonetize?: (id: string) => void;
  onMaster?: (id: string) => void;
  onDistribute?: (id: string) => void;
  onTrackInsights?: (id: string) => void;
  onDownload?: (id: string) => void;
  onCopyLink?: (id: string) => void;
  onDelete?: (id: string) => void;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, onClick, danger = false }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors
        ${danger
          ? "text-red-400 hover:bg-zinc-700"
          : "text-zinc-200 hover:bg-zinc-700"
        }`}
    >
      <span className="w-4 h-4 flex-shrink-0">{icon}</span>
      {label}
    </button>
  );
}

export default function TrackCard({
  track,
  isSelected = false,
  onSelect,
  onEdit,
  onAddToPlaylist,
  onMonetize,
  onMaster,
  onDistribute,
  onTrackInsights,
  onDownload,
  onCopyLink,
  onDelete,
}: TrackCardProps) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fmt = (val: number | null | undefined) =>
    val === null || val === 0 || val === undefined ? "-" : val.toString();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div
      className={`relative flex items-center gap-4 px-4 py-3 rounded transition-colors cursor-pointer overflow-visible
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
          <img src={track.thumbnailUrl} alt={track.title} className="w-full h-full object-cover rounded" />
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
          <span className="text-white text-sm font-semibold truncate">{track.title}</span>
          {track.isHD && (
            <span className="text-xs font-bold text-white bg-zinc-600 px-1.5 py-0.5 rounded-sm leading-none">
              HD
            </span>
          )}
        </div>
        <p className="text-zinc-400 text-xs mt-0.5 truncate">{track.artist}</p>
      </div>

      {/* Duration */}
      <div className="w-16 text-center">
        <span className="text-zinc-300 text-sm tabular-nums">{track.duration}</span>
      </div>

      {/* Date */}
      <div className="w-28 text-center">
        <span className="text-zinc-300 text-sm">{track.date}</span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 w-52 justify-center">
        <span className="flex items-center gap-1 text-zinc-500 text-xs">
          <Heart className="w-3.5 h-3.5" />{fmt(track.likes)}
        </span>
        <span className="flex items-center gap-1 text-zinc-500 text-xs">
          <MessageSquare className="w-3.5 h-3.5" />{fmt(track.comments)}
        </span>
        <span className="flex items-center gap-1 text-zinc-500 text-xs">
          <Repeat2 className="w-3.5 h-3.5" />{fmt(track.reposts)}
        </span>
        <span className="flex items-center gap-1 text-zinc-500 text-xs">
          <Download className="w-3.5 h-3.5" />{fmt(track.downloads)}
        </span>
      </div>

      {/* Plays */}
      <div className="w-16 text-right">
        <span className="text-white text-sm font-semibold tabular-nums">{track.plays}</span>
      </div>

      {/* More menu */}
      <div className="relative flex-shrink-0" ref={menuRef}>
        <button
          className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 z-50 bg-zinc-800 rounded-lg shadow-xl border border-zinc-700 overflow-hidden min-w-[180px] py-1">
            <MenuItem icon={<Pencil className="w-4 h-4" />} label="Edit" onClick={() => { onEdit?.(track.id); setMenuOpen(false); }} />
            <MenuItem icon={<ListPlus className="w-4 h-4" />} label="Add to playlist" onClick={() => { onAddToPlaylist?.(track.id); setMenuOpen(false); }} />
            <div className="my-1 border-t border-zinc-700" />
            <MenuItem icon={<CircleDollarSign className="w-4 h-4" />} label="Monetize" onClick={() => { onMonetize?.(track.id); setMenuOpen(false); }} />
            <MenuItem icon={<SlidersHorizontal className="w-4 h-4" />} label="Master" onClick={() => { onMaster?.(track.id); setMenuOpen(false); }} />
            <MenuItem icon={<Share2 className="w-4 h-4" />} label="Distribute" onClick={() => { onDistribute?.(track.id); setMenuOpen(false); }} />
            <MenuItem icon={<TrendingUp className="w-4 h-4" />} label="Track insights" onClick={() => { onTrackInsights?.(track.id); setMenuOpen(false); }} />
            <MenuItem icon={<Download className="w-4 h-4" />} label="Download file" onClick={() => { onDownload?.(track.id); setMenuOpen(false); }} />
            <MenuItem icon={<Link className="w-4 h-4" />} label="Copy link" onClick={() => { onCopyLink?.(track.id); setMenuOpen(false); }} />
            <div className="my-1 border-t border-zinc-700" />
            <MenuItem icon={<Trash2 className="w-4 h-4" />} label="Delete track" onClick={() => { onDelete?.(track.id); setMenuOpen(false); }} danger />
          </div>
        )}
      </div>
    </div>
  );
}