import { useState, useRef, useEffect } from "react";
import {
  Lock, MoreVertical, Heart, MessageSquare, Repeat2,
  Download, Pencil, ListPlus, CircleDollarSign, SlidersHorizontal, Share2, TrendingUp, Link, Trash2, X
} from "lucide-react";
import type { Track } from "@/shared/types/Track";
import { usePlayer } from "@/features/playerUI/context/usePlayer";
import { useSubscription } from "@/hooks/useSubscription";
import { playbackService } from "@/features/player-core/Playbackservice";
import { trackService } from "../trackService";
import CreatePlaylistOverlay from "@/features/library/tabs/playlists/components/CreatePlaylistOverlay";
import amplify from "@/assets/amplify.png";
import ArtistProUpgradeButton from "@/features/premium/components/ArtistProUpgradeButton";
import TrackDeleteConfirmModal from "./TrackDeleteConfirmModal";

function formatDate(raw: string): string {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDuration(seconds: number | string | null | undefined): string {
  if (!seconds) return "0:00";
  const s = typeof seconds === "string" ? parseInt(seconds, 10) : seconds;
  if (isNaN(s)) return String(seconds);
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function AmplifyModal({ onClose, isArtistPro }: { onClose: () => void; isArtistPro: boolean }) {
  const proTheme = isArtistPro;

  return (
    <>
      <div
        className={proTheme ? "fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]" : "fixed inset-0 z-50"}
        style={proTheme ? undefined : { background: "rgba(246, 235, 235, 0.58)" }}
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4">
        <div
          data-testid="amplify-modal"
          className={`rounded-2xl w-full max-w-[820px] overflow-hidden pointer-events-auto shadow-2xl relative border ${
            proTheme ? "bg-[#1c1608] border-[#d4b253]/40" : "bg-black border-transparent"
          }`}
        >

          <button
            data-testid="amplify-modal-close-btn"
            onClick={onClose}
            className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-10 ${
              proTheme
                ? "bg-[#d4b253] hover:bg-[#e1c36a] text-[#281f07]"
                : "bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white"
            }`}
          >
            <X className="w-4 h-4" />
          </button>

          <div className={`flex flex-col sm:flex-row items-start justify-between px-6 sm:px-10 pt-8 sm:pt-10 pb-4 gap-6 ${proTheme ? "bg-[linear-gradient(135deg,rgba(212,178,83,0.18),rgba(28,22,8,0.15))]" : ""}`}>
            <div className="flex-1">
              {isArtistPro ? (
                <>
                  <h2 className="text-[#f7e6ad] text-2xl sm:text-3xl font-bold leading-tight mb-4">
                    You can now Amplify with Artist-Pro
                  </h2>
                  <p className="text-[#f7e6ad]/90 text-sm leading-relaxed">
                    Coming Soon, you'll be the first to know!
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-white text-2xl sm:text-3xl font-bold leading-tight mb-4">
                    Reach more listeners with Artist Pro
                  </h2>
                  <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                    In order to be eligible, you must have an Artist or Artist Pro subscription.
                  </p>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    With an Artist Pro subscription you can have this track analyzed and recommended to reach{" "}
                    <span className="text-white font-bold">100+ plays by listeners on SoundCloud.</span>
                  </p>
                </>
              )}
            </div>
            <div className={`w-full sm:w-64 h-36 sm:h-44 flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center ${proTheme ? "bg-[#d4b253]/20 ring-1 ring-[#d4b253]/35 shadow-[0_0_0_1px_rgba(212,178,83,0.15),0_20px_40px_rgba(0,0,0,0.35)]" : "bg-zinc-800"}`}>
              <img src={amplify} alt="Artist Pro" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="px-6 sm:px-10 pb-6">
            <div className={`rounded-xl p-5 sm:p-6 ${proTheme ? "bg-[#d4b253]/15 border border-[#d4b253]/30" : "bg-zinc-800/60"}`}>
              {isArtistPro ? (
                <p className="text-[#f7e6ad] text-sm leading-relaxed font-medium">
                  Amplify access is coming soon for Artist Pro members.
                </p>
              ) : (
                <>
                  <p className="text-white text-sm font-bold mb-4">Upgrade to Artist Pro to get:</p>
                  <ul className="space-y-3">
                    {[
                      "Unlimited track recommendations",
                      "Unlimited uploads + replace tracks",
                      "Unlimited track distribution",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-zinc-300 text-sm">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 px-6 sm:px-10 pb-8 sm:pb-10">
            {!isArtistPro ? (
              <ArtistProUpgradeButton
                data-testid="amplify-modal-unlock-btn"
                className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors tracking-tight"
              >
                Unlock with Artist Pro
              </ArtistProUpgradeButton>
            ) : null}
            <button
              data-testid="amplify-modal-later-btn"
              onClick={onClose}
              className={proTheme ? "px-6 py-2.5 text-[#f7e6ad] text-sm font-semibold hover:text-white transition-colors" : "px-6 py-2.5 text-white text-sm font-semibold hover:text-zinc-300 transition-colors"}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

interface TrackCardProps {
  track: Track;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
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
        ${danger ? "text-red-400 hover:bg-zinc-700" : "text-zinc-200 hover:bg-zinc-700"}`}
    >
      <span className="w-4 h-4 flex-shrink-0">{icon}</span>
      {label}
    </button>
  );
}

// Dropdown animation keyframes injected once
const DROPDOWN_STYLE_ID = "track-card-dropdown-anim";
if (typeof document !== "undefined" && !document.getElementById(DROPDOWN_STYLE_ID)) {
  const style = document.createElement("style");
  style.id = DROPDOWN_STYLE_ID;
  style.textContent = `
    @keyframes menuPopDown {
      from { opacity: 0; transform: scale(0.72) translateY(-8px); }
      to   { opacity: 1; transform: scale(1)    translateY(0);    }
    }
    @keyframes menuPopUp {
      from { opacity: 0; transform: scale(0.72) translateY(8px); }
      to   { opacity: 1; transform: scale(1)    translateY(0);   }
    }
  `;
  document.head.appendChild(style);
}

export default function TrackCard({
  track,
  isSelected = false,
  onSelect,
  onEdit,
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
  const [dropdownUp, setDropdownUp] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAmplifyModal, setShowAmplifyModal] = useState(false);
  const [showPlaylistOverlay, setShowPlaylistOverlay] = useState(false);
  const [amplifyHovered, setAmplifyHovered] = useState(false);
  const [downloadState, setDownloadState] = useState<"idle" | "loading" | "done">("idle");
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const downloadDoneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isArtistPro } = useSubscription();
  const fallbackDownload = onDownload;

  const { currentTrack, isPlaying, setCurrentTrack, setIsPlaying } = usePlayer();
  const isThisTrack = currentTrack?.id === track.id;
  const playing = isThisTrack && isPlaying;

  const handlePlayToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isThisTrack) {
      setIsPlaying(!isPlaying);
    } else {
      let playableTrack = track;

      if (
        track.isPrivate &&
        (!track.privateToken || !track.audioUrl)
      ) {
        try {
          playableTrack = await trackService.getTrackDetails(track.id);
        } catch {
          playableTrack = track;
        }
      }

      setCurrentTrack({
        id: playableTrack.id,
        title: playableTrack.title,
        artist: playableTrack.artist,
        thumbnailUrl: playableTrack.thumbnailUrl ?? undefined,
        artworkUrl: playableTrack.thumbnailUrl ?? undefined,
        privateToken: playableTrack.privateToken ?? undefined,
        duration: playableTrack.duration ?? 0,
      });
      setIsPlaying(true);
    }
  };

  const fmt = (val: number | null | undefined) =>
    val === null || val === 0 || val === undefined ? "-" : val.toString();

  useEffect(() => {
    return () => {
      if (downloadDoneTimerRef.current) {
        clearTimeout(downloadDoneTimerRef.current);
      }
    };
  }, []);

  const handleDownloadTrack = async () => {
    if (!track.id || downloadState === "loading") return;

    try {
      setDownloadState("loading");
      const streamData = await playbackService.requestStreamUrl(track.id);
      const audioResponse = await fetch(streamData.stream.url);
      const audioBlob = await audioResponse.blob();
      const objectUrl = URL.createObjectURL(audioBlob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${track.title || "track"}.${streamData.stream.format === "hls" ? "m3u8" : "mp3"}`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

      setDownloadState("done");
      if (downloadDoneTimerRef.current) clearTimeout(downloadDoneTimerRef.current);
      downloadDoneTimerRef.current = setTimeout(() => {
        setDownloadState("idle");
      }, 1400);
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadState("idle");
      fallbackDownload?.(track.id);
    }
  };

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
      data-testid={`track-card-${track.id}`}
      className={`relative flex items-center gap-3 px-4 py-3 rounded transition-colors cursor-pointer overflow-visible
        ${hovered ? "bg-zinc-800" : "bg-zinc-900"}
        border border-transparent hover:border-zinc-700`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Checkbox */}
      <button
        data-testid={`track-card-select-${track.id}`}
        onClick={(e) => { e.stopPropagation(); onSelect?.(track.id); }}
        className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-colors
          ${isSelected
            ? "bg-white border-white"
            : "bg-transparent border-zinc-500 hover:border-white"
          }`}
      >
        {isSelected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Thumbnail */}
      <div
        data-testid={`track-card-thumbnail-${track.id}`}
        className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-zinc-700 rounded overflow-hidden group"
        onClick={handlePlayToggle}
      >
        {track.thumbnailUrl ? (
          <img src={track.thumbnailUrl} alt={track.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-zinc-700" />
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200
          ${playing ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white flex items-center justify-center shadow-md">
            {playing ? (
              <svg width="9" height="9" viewBox="0 0 14 14" fill="black">
                <rect x="1" y="1" width="4" height="12" />
                <rect x="9" y="1" width="4" height="12" />
              </svg>
            ) : (
              <svg width="9" height="9" viewBox="0 0 14 14" fill="black">
                <polygon points="2,0 14,7 2,14" />
              </svg>
            )}
          </div>
        </div>
        {track.isPrivate && (
          <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-0.5 z-10">
            <Lock className="w-3 h-3 text-zinc-400" />
          </div>
        )}
      </div>

      {/* Title + Artist */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-semibold truncate">{track.title}</span>
          {track.isHD && (
            <span className="text-xs font-bold text-white bg-zinc-600 px-1.5 py-0.5 rounded-sm leading-none flex-shrink-0">
              HD
            </span>
          )}
        </div>
        <p className="text-zinc-400 text-xs mt-0.5 truncate">{track.artist}</p>
      </div>

      {/* Duration */}
      <div className="hidden sm:block w-16 text-center flex-shrink-0">
        <span className="text-zinc-300 text-sm tabular-nums">{formatDuration(track.duration)}</span>
      </div>

      {/* Date */}
      <div className="hidden md:block w-28 text-center flex-shrink-0">
        <span className="text-zinc-300 text-sm">{formatDate(track.date)}</span>
      </div>

      {/* Engagements */}
      <div className="hidden lg:flex items-center gap-3 w-48 justify-center flex-shrink-0">
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
      <div className="w-12 sm:w-16 text-right flex-shrink-0">
        <span className="text-white text-sm tabular-nums">{track.plays}</span>
      </div>

      {/* Amplify button */}
      <button
        data-testid={`track-card-amplify-btn-${track.id}`}
        onClick={(e) => { e.stopPropagation(); setShowAmplifyModal(true); }}
        onMouseEnter={() => setAmplifyHovered(true)}
        onMouseLeave={() => setAmplifyHovered(false)}
        className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-bold transition-all flex-shrink-0 tracking-tight
          ${amplifyHovered ? "bg-indigo-500 opacity-80" : "bg-indigo-400"}`}
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 1L9 6H14L10 9.5L11.5 14L7 11L2.5 14L4 9.5L0 6H5L7 1Z" fill="white" />
        </svg>
        Amplify
      </button>

      {/* More menu */}
      <div data-testid={`track-card-menu-container-${track.id}`} className="relative flex-shrink-0" ref={menuRef}>
        <button
          data-testid={`track-card-menu-btn-${track.id}`}
          ref={menuButtonRef}
          className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            if (!menuOpen && menuButtonRef.current) {
              const rect = menuButtonRef.current.getBoundingClientRect();
              const menuHeight = 380;
              const spaceBelow = window.innerHeight - rect.bottom;
              setDropdownUp(spaceBelow < menuHeight);
            }
            setMenuOpen((prev) => !prev);
          }}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <div
            data-testid={`track-card-menu-dropdown-${track.id}`}
            style={{
              transformOrigin: dropdownUp ? "bottom right" : "top right",
              animation: `${dropdownUp ? "menuPopUp" : "menuPopDown"} 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
            }}
            className={`absolute right-0 z-50 bg-zinc-800 rounded-lg shadow-xl border border-zinc-700 overflow-hidden min-w-[180px] py-1
              ${dropdownUp ? "bottom-full mb-1" : "top-full mt-1"}`}
          >
            <MenuItem icon={<Pencil className="w-4 h-4" />} label="Edit" onClick={() => { onEdit?.(track.id); setMenuOpen(false); }} />
            <MenuItem icon={<ListPlus className="w-4 h-4" />} label="Add to playlist" onClick={() => { setShowPlaylistOverlay(true); setMenuOpen(false); }} />
            {/* Amplify in menu on mobile */}
            <div className="sm:hidden">
              <MenuItem icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L9 6H14L10 9.5L11.5 14L7 11L2.5 14L4 9.5L0 6H5L7 1Z" fill="currentColor" /></svg>} label="Amplify" onClick={() => { setShowAmplifyModal(true); setMenuOpen(false); }} />
            </div>
            <div className="my-1 border-t border-zinc-700" />
            <MenuItem icon={<CircleDollarSign className="w-4 h-4" />} label="Monetize" onClick={() => { onMonetize?.(track.id); setMenuOpen(false); }} />
            <MenuItem icon={<SlidersHorizontal className="w-4 h-4" />} label="Master" onClick={() => { onMaster?.(track.id); setMenuOpen(false); }} />
            <MenuItem icon={<Share2 className="w-4 h-4" />} label="Distribute" onClick={() => { onDistribute?.(track.id); setMenuOpen(false); }} />
            <MenuItem icon={<TrendingUp className="w-4 h-4" />} label="Track insights" onClick={() => { onTrackInsights?.(track.id); setMenuOpen(false); }} />
            <MenuItem
              icon={<Download className="w-4 h-4" />}
              label="Download file"
              onClick={async () => {
                setMenuOpen(false);
                await handleDownloadTrack();
              }}
            />
            <MenuItem icon={<Link className="w-4 h-4" />} label="Copy link" onClick={() => { onCopyLink?.(track.id); setMenuOpen(false); }} />
            <div className="my-1 border-t border-zinc-700" />
            <MenuItem icon={<Trash2 className="w-4 h-4" />} label="Delete track" onClick={() => { setMenuOpen(false); setShowDeleteModal(true); }} danger />
          </div>
        )}
      </div>

      {showAmplifyModal && (
        <AmplifyModal onClose={() => setShowAmplifyModal(false)} isArtistPro={isArtistPro} />
      )}

      {showDeleteModal && (
        <TrackDeleteConfirmModal
          track={track}
          onCancel={() => setShowDeleteModal(false)}
          onDeleted={(id) => {
            setShowDeleteModal(false);
            onDelete?.(id);
          }}
        />
      )}

      {showPlaylistOverlay && (
        <CreatePlaylistOverlay
          isOpen={showPlaylistOverlay}
          onClose={() => setShowPlaylistOverlay(false)}
          track={{
            id: track.id,
            title: track.title,
            artist: track.artist,
            coverUrl: track.thumbnailUrl || "",
          }}
          defaultCoverUrl={track.thumbnailUrl || ""}
          autoAddTrackId={track.id}
        />
      )}

      {downloadState !== "idle" && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />
          <div className="relative w-full max-w-[420px] rounded-2xl border border-zinc-700 bg-[#121212] px-6 py-5 shadow-2xl">
            <div className="flex items-start gap-4">
              <div
                className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-full ${
                  downloadState === "done" ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-300"
                }`}
              >
                {downloadState === "done" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  {downloadState === "done" ? "Done" : "Downloading your file shortly..."}
                </p>
                <p className={`mt-1 text-xs leading-relaxed ${downloadState === "done" ? "text-emerald-400" : "text-zinc-400"}`}>
                  {downloadState === "done"
                    ? "Your browser has started downloading the track."
                    : "We’re preparing the stream URL and starting the download."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
