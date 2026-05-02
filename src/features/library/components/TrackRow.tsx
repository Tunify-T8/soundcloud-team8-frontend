import { useState, useRef, useEffect } from "react";
import {
  Heart,
  UserPlus,
  MoreHorizontal,
  Repeat2,
  Share2,
  Link,
  ListEnd,
  ListPlus,
  Radio,
} from "lucide-react";
import SongCard from "@/components/ui/SongCard";
import type { TrackItem } from "../types";
import { usePlayer } from "@/features/playerUI/context/usePlayer";
import ShareOverlay from "@/components/ui/ShareOverlay";
import CreatePlaylistOverlay from "@/features/library/tabs/playlists/components/CreatePlaylistOverlay";

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

export default function TrackRow({
  track,
  view = "list",
  isLiked = false,
  onUnlike,
}: TrackRowProps) {
  const { currentTrack, isPlaying, setCurrentTrack, setIsPlaying } =
    usePlayer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAbove, setMenuAbove] = useState(false);
  const [unliking, setUnliking] = useState(false);
  const [showShareOverlay, setShowShareOverlay] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [showPlaylistOverlay, setShowPlaylistOverlay] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
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

  const buildShareUrl = () => {
    if (typeof window === "undefined") return "";
    if (!track.id) return window.location.href;
    return `${window.location.origin}/tracks/${track.id}`;
  };

  const showCopiedMessage = () => {
    setShowCopyToast(true);
    window.setTimeout(() => {
      setShowCopyToast(false);
    }, 2200);
  };

  const handleCopyLink = async () => {
    if (isCopying) return;
    setIsCopying(true);
    const nextShareUrl = buildShareUrl();
    if (nextShareUrl) {
      await navigator.clipboard.writeText(nextShareUrl);
      showCopiedMessage();
    }
    setIsCopying(false);
  };

  const handleMenuAction = (label: string) => {
    if (label === "Share") {
      const nextShareUrl = buildShareUrl();
      if (nextShareUrl) {
        setShareUrl(nextShareUrl);
        setShowShareOverlay(true);
      }
    }
    if (label === "Copy Link") {
      void handleCopyLink();
    }
    if (label === "Add to Playlist") {
      setShowPlaylistOverlay(true);
    }
    setMenuOpen(false);
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
                className={`absolute left-0 ${menuAbove ? "bottom-full mb-1" : "top-full mt-1"} z-50 min-w-[180px] overflow-visible rounded-md border border-[hsl(0,0%,18%)] bg-[#0b0b0b] py-0.5 shadow-2xl`}
              >
                {MENU_ITEMS.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    data-testid={`track-menu-${label.toLowerCase().replace(/ /g, "-")}-${track.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuAction(label);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[13px] font-semibold text-white hover:text-zinc-500"
                  >
                    <Icon size={14} className="text-zinc-300 shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p
          data-testid={`track-title-${track.id}`}
          className="text-white text-xs font-bold truncate"
        >
          {track.title}
        </p>
        <p
          data-testid={`track-artist-${track.id}`}
          className="text-zinc-400 text-xs truncate"
        >
          {track.artist}
        </p>
        {showShareOverlay && (
          <ShareOverlay
            onClose={() => setShowShareOverlay(false)}
            shareUrl={shareUrl}
          />
        )}
        {showCopyToast && (
          <div className="fixed right-6 top-6 z-[140]">
            <div className="flex max-w-[360px] items-center gap-3 rounded-[4px] border border-zinc-500 bg-[#2f2f2f] px-4 py-2.5 text-white shadow-xl">
              <div className="text-emerald-400 text-lg">✓</div>
              <div className="text-[13px] font-semibold leading-tight">
                Link has been copied to the clipboard!
              </div>
            </div>
          </div>
        )}
        <CreatePlaylistOverlay
          isOpen={showPlaylistOverlay}
          onClose={() => setShowPlaylistOverlay(false)}
          track={{
            id: track.id,
            title: track.title,
            artist: track.artist,
            coverUrl: track.coverUrl ?? "",
          }}
          defaultCoverUrl={track.coverUrl ?? ""}
          autoAddTrackId={track.id}
        />
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
