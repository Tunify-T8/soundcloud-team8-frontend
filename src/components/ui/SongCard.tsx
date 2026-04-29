import { useEffect, useMemo, useRef, useState } from "react";
import {
  Heart,
  Repeat2,
  Share2,
  Copy,
  MoreHorizontal,
  ListPlus,
  ListMusic,
  Radio,
  Download,
  Check,
  Loader2,
} from "lucide-react";
import { SiSoundcloud } from "react-icons/si";
import { Link } from "react-router-dom";
import { waveGenerators } from "../Waveforms";
import { useLike } from "@/features/feed/hooks/useLike";
import { Genre } from "@/shared/types/Genre";
import { usePlayer } from "@/features/playerUI/context/usePlayer";
import { useSubscription } from "@/hooks/useSubscription";
import { useMe } from "@/features/profile/context/useMe";
import { playbackService } from "@/features/player-core/Playbackservice";
import CreatePlaylistOverlay from "@/features/library/tabs/playlists/components/CreatePlaylistOverlay";

// ─── IndexedDB helpers ────────────────────────────────────────────────────────

const DB_NAME = "sc_downloads";
const STORE = "tracks";

function openDB(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

async function saveDownload(
  userId: string,
  trackId: string,
  meta: { id: string; title: string; artist: string; coverUrl: string },
  blob: Blob,
  artwork?: Blob | null
) {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).put({ meta, audio: blob, artwork: artwork ?? null }, `user_${userId}_song_${trackId}`);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PlayerProps {
  trackId?: string;
  isLikedInitial?: boolean;
  isRepostedInitial?: boolean;
  artistName?: string;
  title?: string;
  coverUrl?: string;
  timeAgo?: string;
  genre?: Genre;
  likes?: string;
  reposts?: string;
  plays?: string;
  comments?: string;
  progress?: number;
  waveformSeed?: number;
  repostDisabled?: boolean;
  onToggleRepost?: () => void;
  onAddToNextUp?: () => void;
  onAddToPlaylist?: () => void;
  onStation?: () => void;
  offlineSrc?: string;
}

export default function SongCard({
  trackId = "",
  isLikedInitial = false,
  isRepostedInitial = false,
  artistName = "",
  title = "",
  coverUrl = "",
  timeAgo = "",
  genre = Genre.POP,
  likes = "",
  reposts = "",
  plays = "",
  comments = "",
  progress = 0,
  waveformSeed = 0,
  repostDisabled = false,
  onToggleRepost,
  onAddToNextUp,
  onAddToPlaylist,
  onStation,
  offlineSrc,
}: PlayerProps) {
  const { currentTrack, isPlaying, progress: playerProgress, setCurrentTrack, setIsPlaying, requestSeek } = usePlayer();
  const { hasOfflineListening } = useSubscription();
  const { me } = useMe();

  const isThisTrack = currentTrack?.id === trackId;
  const playing = isThisTrack && isPlaying;

  const [isWaveHovered, setIsWaveHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPlaylistOverlay, setShowPlaylistOverlay] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showDownloadTooltip, setShowDownloadTooltip] = useState(false);
  const [randomSeed] = useState(() => Math.random() * 1000000);

  // ── Play toggle ─────────────────────────────────────────────────────────
  const handlePlayToggle = () => {
    if (!trackId) return;
    if (isThisTrack) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack({
        id: trackId,
        title,
        artist: artistName,
        thumbnailUrl: coverUrl || undefined,
        duration: 0,
        offlineSrc: offlineSrc,
      });
      setIsPlaying(true);
    }
  };

  const { isLiked, likesCount, toggleLike } = useLike(
    isLikedInitial,
    Number(likes) || 0,
    trackId,
  );

  // ── Download ─────────────────────────────────────────────────────────────
  async function handleDownload() {
    if (!hasOfflineListening || !me?.id || downloading || downloaded || !trackId) return;
    setDownloading(true);
    try {
      const streamData = await playbackService.requestStreamUrl(trackId);
      const audioRes = await fetch(streamData.stream.url);
      const blob = await audioRes.blob();
      const artworkBlob =
        coverUrl
          ? await fetch(coverUrl)
              .then((res) => (res.ok ? res.blob() : null))
              .catch(() => null)
          : null;

      const estimate = await navigator.storage.estimate();
      const free = (estimate.quota ?? 0) - (estimate.usage ?? 0);
      const requiredBytes = blob.size + (artworkBlob?.size ?? 0);
      if (free < requiredBytes) {
        alert("Not enough storage space to download this track.");
        return;
      }

      await navigator.storage.persist().catch(() => {});
      await saveDownload(
        me.id,
        trackId,
        { id: trackId, title, artist: artistName, coverUrl },
        blob,
        artworkBlob,
      );
      setDownloaded(true);
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download. Please try again.");
    } finally {
      setDownloading(false);
      setMenuOpen(false);
    }
  }

  const GAP = 1;
  const effectiveSeed = waveformSeed || randomSeed;
  const generatorIndex = Math.floor(effectiveSeed) % waveGenerators.length;
  const menuRef = useRef<HTMLDivElement>(null);

  const bars = useMemo((): number[] => {
    return waveGenerators[generatorIndex](effectiveSeed);
  }, [generatorIndex, effectiveSeed]);

  const displayProgress = isThisTrack ? playerProgress : progress;

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    if (!isThisTrack) {
      setCurrentTrack({
        id: trackId,
        title,
        artist: artistName,
        thumbnailUrl: coverUrl || undefined,
        duration: 0,
        offlineSrc: offlineSrc,
      });
      setIsPlaying(true);
    }
    requestSeek(trackId, pct);
  };

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  return (
    <div className="bg-[#0b0b0b] rounded-sm flex gap-0 overflow-visible w-full font-sans">
      {/* Cover Art */}
      {trackId ? (
        <Link
          to={`/tracks/${trackId}`}
          className="w-[130px] h-[130px] shrink-0 bg-[#111] relative block"
          aria-label={`Open ${title || "track"}`}
        >
          {coverUrl ? (
            <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#111]">
              <SiSoundcloud size={40} className="text-[hsl(0,0%,30%)]" />
            </div>
          )}
        </Link>
      ) : (
        <div className="w-[130px] h-[130px] shrink-0 bg-[#111] relative">
          {coverUrl ? (
            <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#111]">
              <SiSoundcloud size={40} className="text-[hsl(0,0%,30%)]" />
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 pt-0 pb-3 min-w-0">
        {/* Top row */}
        <div className="flex items-start gap-3 mb-1">
          <button
            onClick={handlePlayToggle}
            disabled={!trackId}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="black">
                <rect x="1" y="1" width="4" height="12" />
                <rect x="9" y="1" width="4" height="12" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="black">
                <polygon points="2,0 14,7 2,14" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-[hsl(0,0%,50%)] truncate mb-0.5">{artistName}</div>
            <p className="text-[13px] text-white font-medium leading-snug line-clamp-2">{title}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-[hsl(0,0%,40%)] whitespace-nowrap">{timeAgo}</span>
            <span className="text-[10px] text-[hsl(0,0%,55%)] bg-[hsl(0,0%,12%)] border border-[hsl(0,0%,20%)] px-2 py-0.5 rounded-sm whitespace-nowrap">
              # {genre}
            </span>
          </div>
        </div>

        {/* Waveform */}
        <div
          className="flex items-end h-[44px] cursor-pointer mt-1 mb-2 w-full"
          style={{ gap: `${GAP}px` }}
          onClick={handleWaveformClick}
          onMouseEnter={() => setIsWaveHovered(true)}
          onMouseLeave={() => setIsWaveHovered(false)}
        >
          {bars.map((height, i) => {
            const pos = i / (bars.length - 1);
            const played = pos <= displayProgress;
            const showPlayedProgress = isThisTrack && played;
            const inactiveColor = isWaveHovered ? "#f5f5f5" : "#d6d6d6";
            return (
              <div
                key={i}
                className="flex-1 rounded-[1px]"
                style={{
                  minWidth: 0,
                  maxWidth: "2px",
                  height: `${(0.28 + height * 0.5) * 100}%`,
                  backgroundColor: showPlayedProgress ? "#F94C00" : inactiveColor,
                  opacity: showPlayedProgress ? 1 : isWaveHovered ? 1 : 0.92,
                  borderRadius: "1px",
                }}
              />
            );
          })}
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLike}
              className="flex h-7 w-9 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f]"
              aria-label={`Like (${likesCount})`}
            >
              <Heart size={12} fill={isLiked ? "currentColor" : "none"} />
              <span className="sr-only">{likesCount}</span>
            </button>
            <button
              type="button"
              onClick={onToggleRepost}
              disabled={repostDisabled}
              aria-label={isRepostedInitial ? "Undo repost" : "Repost"}
              className="flex h-7 w-9 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Repeat2 size={12} />
              <span className="sr-only">{reposts}</span>
            </button>
            <button className="flex h-7 w-9 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f]">
              <Share2 size={12} />
            </button>
            <button className="flex h-7 w-9 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f]">
              <Copy size={12} />
            </button>

            {/* ··· dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-7 w-9 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f]"
                aria-label="More options"
              >
                <MoreHorizontal size={12} />
              </button>

              {menuOpen && (
                <div className="absolute left-0 top-full mt-1 z-50 min-w-[180px] overflow-visible rounded-md border border-[hsl(0,0%,18%)] bg-[#0b0b0b] py-0.5 shadow-2xl">

                  <button
                    onClick={() => { onAddToNextUp?.(); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[13px] font-semibold text-white hover:text-zinc-500"
                  >
                    <ListMusic size={14} className="text-zinc-300" />
                    Add to Next up
                  </button>

                  <button
                    onClick={() => { onAddToPlaylist?.(); setShowPlaylistOverlay(true); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[13px] font-semibold text-white hover:text-zinc-500"
                  >
                    <ListPlus size={14} className="text-zinc-300" />
                    Add to Playlist
                  </button>

                  <button
                    onClick={() => { onStation?.(); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[13px] font-semibold text-white hover:text-zinc-500"
                  >
                    <Radio size={14} className="text-zinc-300" />
                    Station
                  </button>

                  <div className="my-0.5 border-t border-[hsl(0,0%,15%)]" />

                  {/* Download — dimmed ONLY when user is not Artist Pro */}
                  <div
                    className="relative"
                    onMouseEnter={() => { if (!hasOfflineListening) setShowDownloadTooltip(true); }}
                    onMouseLeave={() => setShowDownloadTooltip(false)}
                  >
                    <button
                      onClick={handleDownload}
                      disabled={!hasOfflineListening || downloading || downloaded}
                      className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[13px] font-semibold transition-colors
                        ${!hasOfflineListening
                          // Non-pro: fully dimmed, not clickable
                          ? "opacity-40 cursor-not-allowed text-zinc-400"
                          : downloaded
                            // Pro + already downloaded: green success state
                            ? "text-green-400 cursor-default"
                            // Pro + not yet downloaded: active, full white
                            : "text-white hover:text-zinc-400"
                        }`}
                    >
                      {downloading ? (
                        <Loader2 size={14} className="animate-spin text-zinc-400" />
                      ) : downloaded ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Download
                          size={14}
                          className={hasOfflineListening ? "text-zinc-300" : "text-zinc-500"}
                        />
                      )}
                      {downloading ? "Downloading…" : downloaded ? "Downloaded" : "Download"}
                    </button>

                    {/* Tooltip shown only for non-pro users */}
                    {showDownloadTooltip && !hasOfflineListening && (
                      <div
                        className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 rounded-md text-[11px] text-white whitespace-nowrap z-50 pointer-events-none"
                        style={{ background: "#1a1a1a", border: "1px solid hsl(0,0%,22%)", boxShadow: "0 4px 16px rgba(0,0,0,0.6)" }}
                      >
                        Upgrade to Artist Pro to download songs
                        <div
                          className="absolute right-full top-1/2 -translate-y-1/2"
                          style={{
                            width: 0, height: 0,
                            borderTop: "5px solid transparent",
                            borderBottom: "5px solid transparent",
                            borderRight: "5px solid #1a1a1a",
                          }}
                        />
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[hsl(0,0%,40%)]">
            <span className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor">
                <polygon points="2,0 14,7 2,14" />
              </svg>
              {plays}
            </span>
            <span className="flex items-center gap-1">
              <SiSoundcloud size={12} /> {comments}
            </span>
          </div>
        </div>
      </div>

      <CreatePlaylistOverlay
        isOpen={showPlaylistOverlay}
        onClose={() => setShowPlaylistOverlay(false)}
        track={{ id: trackId, title, artist: artistName, coverUrl }}
        defaultCoverUrl={coverUrl}
        autoAddTrackId={trackId}
      />
    </div>
  );
}
