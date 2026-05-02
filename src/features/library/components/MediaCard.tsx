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
import { useNavigate } from "react-router-dom";
import ShareOverlay from "@/components/ui/ShareOverlay";
import CreatePlaylistOverlay from "@/features/library/tabs/playlists/components/CreatePlaylistOverlay";
import { playlistService } from "../libraryService";

interface MediaCardProps {
  id: string;
  title: string;
  subtitle: string;
  coverUrl?: string | null;
  entityType?: "track" | "playlist" | "album";
  trackArtist?: string;
  isLiked?: boolean;
  isPlaying?: boolean;
  onPlay?: () => void;
  onLike?: () => void;
  onFollow?: () => void;
  onClick?: () => void;
  linkTo?: string;
  hoverVariant?: "play" | "dim";
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
  entityType,
  trackArtist,
  isLiked = false,
  isPlaying = false,
  onPlay,
  onLike,
  onFollow,
  onClick,
  linkTo,
  hoverVariant = "play",
}: MediaCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAbove, setMenuAbove] = useState(false);
  const [showShareOverlay, setShowShareOverlay] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [showPlaylistOverlay, setShowPlaylistOverlay] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const isTrack = entityType === "track";

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

  function handleCardClick() {
    if (onClick) {
      onClick();
      return;
    }

    if (linkTo) {
      navigate(linkTo);
    }
  }

  const buildShareUrl = () => {
    if (typeof window === "undefined") return "";
    if (!linkTo) return window.location.href;
    if (/^https?:\/\//i.test(linkTo)) return linkTo;
    const normalized = linkTo.startsWith("/") ? linkTo : `/${linkTo}`;
    return `${window.location.origin}${normalized}`;
  };

  const fetchShareUrl = async (): Promise<string | null> => {
    if (isCopying) return null;
    setIsCopying(true);
    let nextShareUrl: string | null = null;

    if (entityType === "playlist") {
      nextShareUrl = await playlistService.getPlaylistShareUrl(id);
    }

    if (!nextShareUrl) {
      nextShareUrl = buildShareUrl() || null;
    }

    setIsCopying(false);
    return nextShareUrl;
  };

  const showCopiedMessage = () => {
    setShowCopyToast(true);
    window.setTimeout(() => {
      setShowCopyToast(false);
    }, 2200);
  };

  const handleCopyLink = async () => {
    const nextShareUrl = await fetchShareUrl();
    if (!nextShareUrl) return;
    await navigator.clipboard.writeText(nextShareUrl);
    showCopiedMessage();
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
    if (label === "Add to Playlist" && isTrack) {
      setShowPlaylistOverlay(true);
    }
    setMenuOpen(false);
  };

  const menuItems = isTrack
    ? MENU_ITEMS
    : MENU_ITEMS.filter((item) => item.label !== "Add to Playlist");

  return (
    <div
      data-testid={`media-card-${id}`}
      className="cursor-pointer group relative"
      onClick={handleCardClick}
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

        {hoverVariant === "play" && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div
              data-testid={`media-card-play-${id}`}
              onClick={(e) => {
                e.stopPropagation();
                onPlay?.();
              }}
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
        )}
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-end gap-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <button
          data-testid={`media-card-like-${id}`}
          onClick={(e) => {
            e.stopPropagation();
            onLike?.();
          }}
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
          onClick={(e) => {
            e.stopPropagation();
            onFollow?.();
          }}
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
              className={`absolute left-0 ${menuAbove ? "bottom-full mb-1" : "top-full mt-1"} z-50 min-w-[180px] overflow-visible rounded-md border border-[hsl(0,0%,18%)] bg-[#0b0b0b] py-0.5 shadow-2xl`}
            >
              {menuItems.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  data-testid={`media-card-menu-${label.toLowerCase().replace(/ /g, "-")}-${id}`}
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
        data-testid={`media-card-title-${id}`}
        className="text-white text-xs font-bold truncate"
      >
        {title}
      </p>
      <p
        data-testid={`media-card-subtitle-${id}`}
        className="text-zinc-400 text-xs truncate"
      >
        {subtitle}
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
          id,
          title,
          artist: trackArtist ?? subtitle ?? "",
          coverUrl: coverUrl ?? "",
        }}
        defaultCoverUrl={coverUrl ?? ""}
        autoAddTrackId={id}
      />
    </div>
  );
}
