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
import { Link, useNavigate } from "react-router-dom";
import { waveGenerators } from "../Waveforms";
import { engagementService } from "@/features/engagement/services/engagementService";
import { Genre } from "@/shared/types/Genre";
import { usePlayer } from "@/features/playerUI/context/usePlayer";
import { useSubscription } from "@/hooks/useSubscription";
import { useMe } from "@/features/profile/context/useMe";
import { playbackService } from "@/features/player-core/Playbackservice";
import CreatePlaylistOverlay from "@/features/library/tabs/playlists/components/CreatePlaylistOverlay";

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
  artwork?: Blob | null,
) {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).put(
    { meta, audio: blob, artwork: artwork ?? null },
    `user_${userId}_song_${trackId}`,
  );
}

async function hasDownload(userId: string, trackId: string): Promise<boolean> {
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);
  return new Promise((res, rej) => {
    const req = store.get(`user_${userId}_song_${trackId}`);
    req.onsuccess = () => res(Boolean(req.result));
    req.onerror = () => rej(req.error);
  });
}

interface PlayerProps {
  trackId?: string;
  entityLinkTo?: string;
  smallCoverOnMobile?: boolean;
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
  contextTag?: string;
  offlineSrc?: string;
}

export default function SongCard({
  trackId = "",
  entityLinkTo,
  smallCoverOnMobile = false,
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
  contextTag,
  offlineSrc,
}: PlayerProps) {
  const {
    currentTrack,
    isPlaying,
    progress: playerProgress,
    setCurrentTrack,
    setIsPlaying,
    requestSeek,
  } = usePlayer();
  const { hasOfflineListening } = useSubscription();
  const { me } = useMe();
  const navigate = useNavigate();

  const isThisTrack = currentTrack?.id === trackId;
  const playing = isThisTrack && isPlaying;

  const [isWaveHovered, setIsWaveHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPlaylistOverlay, setShowPlaylistOverlay] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showDownloadTooltip, setShowDownloadTooltip] = useState(false);
  const [showAlreadyDownloaded, setShowAlreadyDownloaded] = useState(false);
  const [randomSeed] = useState(() => Math.random() * 1000000);

  const handlePlayToggle = () => {
    if (!trackId) return;
    if (isThisTrack) {
      setIsPlaying(!isPlaying);
      return;
    }

    setCurrentTrack({
      id: trackId,
      title,
      artist: artistName,
      thumbnailUrl: coverUrl || undefined,
      duration: 0,
      offlineSrc,
    });
    setIsPlaying(true);
  };

  const [isLiked, setIsLiked] = useState(isLikedInitial);
  const [isReposted, setIsReposted] = useState(isRepostedInitial);
  const [likesCount, setLikesCount] = useState(Number(likes) || 0);
  const [repostsCount, setRepostsCount] = useState(Number(reposts) || 0);
  const [isLikePending, setIsLikePending] = useState(false);
  const [isRepostPending, setIsRepostPending] = useState(false);

  useEffect(() => {
    setIsLiked(isLikedInitial);
    setIsReposted(isRepostedInitial);
    setLikesCount(Number(likes) || 0);
    setRepostsCount(Number(reposts) || 0);
  }, [trackId, isLikedInitial, isRepostedInitial, likes, reposts]);

  useEffect(() => {
    if (!trackId) return;
    let mounted = true;
    engagementService
      .getEngagement(trackId)
      .then((data) => {
        if (!mounted) return;
        setIsLiked(Boolean(data.isLiked));
        setIsReposted(Boolean(data.isReposted));
        if (Number.isFinite(data.likesCount)) {
          setLikesCount(Number(data.likesCount));
        }
        if (Number.isFinite(data.repostsCount)) {
          setRepostsCount(Number(data.repostsCount));
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [trackId]);

  useEffect(() => {
    if (!trackId || !me?.id || !hasOfflineListening) return;
    let mounted = true;
    hasDownload(me.id, trackId)
      .then((exists) => {
        if (!mounted) return;
        setDownloaded(exists);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [trackId, me?.id, hasOfflineListening]);

  const handleLikeToggle = async () => {
    if (!trackId || isLikePending) return;
    const wasLiked = isLiked;
    setIsLikePending(true);
    setIsLiked(!wasLiked);
    setLikesCount((prev) => Math.max(0, prev + (wasLiked ? -1 : 1)));
    try {
      if (wasLiked) {
        await engagementService.unlikeTrack(trackId);
      } else {
        await engagementService.likeTrack(trackId);
      }
    } catch {
      setIsLiked(wasLiked);
      setLikesCount((prev) => Math.max(0, prev + (wasLiked ? 1 : -1)));
    } finally {
      setIsLikePending(false);
    }
  };

  const handleRepostToggle = async () => {
    if (!trackId || repostDisabled || isRepostPending) return;
    const wasReposted = isReposted;
    setIsRepostPending(true);
    setIsReposted(!wasReposted);
    setRepostsCount((prev) => Math.max(0, prev + (wasReposted ? -1 : 1)));
    try {
      if (wasReposted) {
        await engagementService.unrepostTrack(trackId);
      } else {
        await engagementService.repostTrack(trackId);
      }
      onToggleRepost?.();
    } catch {
      setIsReposted(wasReposted);
      setRepostsCount((prev) => Math.max(0, prev + (wasReposted ? 1 : -1)));
    } finally {
      setIsRepostPending(false);
    }
  };

  async function handleDownload() {
    if (!hasOfflineListening || !me?.id || downloading || !trackId) return;

    if (downloaded) {
      setShowAlreadyDownloaded(true);
      return;
    }

    setDownloading(true);
    try {
      const streamData = await playbackService.requestStreamUrl(trackId);
      const audioRes = await fetch(streamData.stream.url);
      const blob = await audioRes.blob();
      const artworkBlob = coverUrl
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
      setShowAlreadyDownloaded(false);
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
  const cardPrimaryLink = entityLinkTo || (trackId ? `/tracks/${trackId}` : "");
  const mobileCoverSizeClass = smallCoverOnMobile
    ? "h-[72px] w-[72px]"
    : "h-[88px] w-[88px]";

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
        offlineSrc,
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
    <div className="bg-[#0b0b0b] rounded-sm flex gap-0 overflow-visible w-full min-w-0 font-sans">
      {cardPrimaryLink ? (
        <Link
          to={cardPrimaryLink}
          className={`shrink-0 bg-[#111] relative block sm:h-[130px] sm:w-[130px] ${mobileCoverSizeClass}`}
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
        <div className={`shrink-0 bg-[#111] relative sm:h-[130px] sm:w-[130px] ${mobileCoverSizeClass}`}>
          {coverUrl ? (
            <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#111]">
              <SiSoundcloud size={40} className="text-[hsl(0,0%,30%)]" />
            </div>
          )}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col px-2 pb-1 pt-0.5 sm:px-4 sm:pb-3 sm:pt-0">
        <div className="mb-1 flex flex-wrap items-start gap-1.5 sm:flex-nowrap sm:gap-3">
          <button
            onClick={handlePlayToggle}
            disabled={!trackId}
            className="h-6 w-6 shrink-0 rounded-full bg-white flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed sm:h-9 sm:w-9"
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
            <div className="mb-0.5 truncate text-[8px] text-[hsl(0,0%,50%)] sm:text-[11px]">
              {artistName}
            </div>
            {cardPrimaryLink ? (
              <Link
                to={cardPrimaryLink}
                className="block line-clamp-2 text-[10px] font-medium leading-snug text-white hover:underline sm:text-[13px]"
              >
                {title}
              </Link>
            ) : (
              <p className="line-clamp-2 text-[10px] font-medium leading-snug text-white sm:text-[13px]">
                {title}
              </p>
            )}
          </div>

          <div className="flex w-full items-center gap-1 pl-7 sm:w-auto sm:shrink-0 sm:gap-2 sm:pl-0">
            <span className="whitespace-nowrap text-[8px] text-[hsl(0,0%,40%)] sm:text-[11px]">
              {timeAgo}
            </span>
            <span className="whitespace-nowrap rounded-sm border border-[hsl(0,0%,20%)] bg-[hsl(0,0%,12%)] px-1 py-0.5 text-[7px] text-[hsl(0,0%,55%)] sm:px-2 sm:text-[10px]">
              {contextTag ?? `# ${genre}`}
            </span>
          </div>
        </div>

        <div
          className="relative mb-1 mt-0.5 flex h-[34px] w-full cursor-pointer items-center sm:h-[52px]"
          style={{ gap: `${GAP}px` }}
          onClick={handleWaveformClick}
          onMouseEnter={() => setIsWaveHovered(true)}
          onMouseLeave={() => setIsWaveHovered(false)}
        >
          <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/20" />
          {bars.map((height, i) => {
            const pos = i / (bars.length - 1);
            const played = pos <= displayProgress;
            const showPlayedProgress = isThisTrack && played;
            const inactiveColor = isWaveHovered ? "#d8d8d8" : "#c8c8c8";
            const lowerNoise =
              (Math.sin(effectiveSeed * 0.017 + i * 1.913) + 1) / 2;
            const topHeight = 8 + height * 29;
            const bottomHeight = 2 + height * (4 + lowerNoise * 6);
            const barColor = showPlayedProgress ? "#ff5500" : inactiveColor;
            return (
              <div
                key={i}
                className="relative flex-1"
                style={{
                  minWidth: "1px",
                  height: "100%",
                }}
              >
                <div
                  className="absolute bottom-1/2 left-0 w-full rounded-[1px] transition-colors duration-150"
                  style={{
                    height: `${topHeight}px`,
                    backgroundColor: barColor,
                    opacity: showPlayedProgress ? 1 : isWaveHovered ? 1 : 0.94,
                    borderRadius: "1px",
                  }}
                />
                <div
                  className="absolute left-0 top-1/2 w-full rounded-[1px] transition-colors duration-150"
                  style={{
                    height: `${bottomHeight}px`,
                    backgroundColor: barColor,
                    opacity: showPlayedProgress ? 0.78 : isWaveHovered ? 0.78 : 0.66,
                    borderRadius: "1px",
                  }}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-1.5 sm:mt-2 sm:gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 sm:flex-none tracking-tight sm:gap-2">
            <button
              type="button"
              onClick={handleLikeToggle}
              disabled={isLikePending}
              className={`flex h-8 shrink-0 items-center gap-1.5 rounded-[4px] bg-[#2f3033] px-3 text-[13px] font-semibold transition-colors hover:bg-[#3a3b3f] disabled:opacity-60 ${
                isLiked ? "text-[#ff5500]" : "text-zinc-100"
              }`}
              aria-label={`Like (${likesCount})`}
            >
              <Heart size={16} fill={isLiked ? "#ff5500" : "none"} style={{ color: isLiked ? "#ff5500" : "#fff" }} />
              <span>{likesCount}</span>
            </button>
            <button
              type="button"
              onClick={handleRepostToggle}
              disabled={repostDisabled || isRepostPending}
              aria-label={isReposted ? "Undo repost" : "Repost"}
              className={`flex h-8 shrink-0 items-center gap-1.5 rounded-[4px] bg-[#2f3033] px-3 text-[13px] font-semibold transition-colors hover:bg-[#3a3b3f] disabled:cursor-not-allowed disabled:opacity-60 ${
                isReposted ? "text-[#ff5500]" : "text-zinc-100"
              }`}
            >
              <Repeat2 size={16} style={{ color: isReposted ? "#ff5500" : "#fff" }} />
              <span>{repostsCount}</span>
            </button>
            <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f]">
              <Share2 size={16} />
            </button>
            <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f]">
              <Copy size={16} />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f]"
                aria-label="More options"
              >
                <MoreHorizontal size={16} />
              </button>

              {menuOpen && (
                <div className="absolute left-0 top-full mt-1 z-50 min-w-[180px] overflow-visible rounded-md border border-[hsl(0,0%,18%)] bg-[#0b0b0b] py-0.5 shadow-2xl">
                  <button
                    onClick={() => {
                      onAddToNextUp?.();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[13px] font-semibold text-white hover:text-zinc-500"
                  >
                    <ListMusic size={14} className="text-zinc-300" />
                    Add to Next up
                  </button>

                  <button
                    onClick={() => {
                      onAddToPlaylist?.();
                      setShowPlaylistOverlay(true);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[13px] font-semibold text-white hover:text-zinc-500"
                  >
                    <ListPlus size={14} className="text-zinc-300" />
                    Add to Playlist
                  </button>

                  <button
                    onClick={() => {
                      onStation?.();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[13px] font-semibold text-white hover:text-zinc-500"
                  >
                    <Radio size={14} className="text-zinc-300" />
                    Station
                  </button>

                  <div className="my-0.5 border-t border-[hsl(0,0%,15%)]" />

                  <div
                    className="relative"
                    onMouseEnter={() => {
                      if (!hasOfflineListening) setShowDownloadTooltip(true);
                    }}
                    onMouseLeave={() => setShowDownloadTooltip(false)}
                  >
                    <button
                      onClick={handleDownload}
                      disabled={!hasOfflineListening || downloading}
                      className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[13px] font-semibold transition-colors ${
                        !hasOfflineListening
                          ? "opacity-40 cursor-not-allowed text-zinc-400"
                          : downloaded
                            ? "text-green-400 cursor-default"
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

                    {showAlreadyDownloaded && downloaded && (
                      <div className="px-2.5 pb-1.5 text-[11px] text-zinc-300">
                        This song is already downloaded, Check{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            navigate("/me/downloads");
                          }}
                          className="text-[#2f7fdc] underline"
                        >
                          Downloads
                        </button>
                        .
                      </div>
                    )}

                    {showDownloadTooltip && !hasOfflineListening && (
                      <div
                        className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 rounded-md text-[11px] text-white whitespace-nowrap z-50 pointer-events-none"
                        style={{
                          background: "#1a1a1a",
                          border: "1px solid hsl(0,0%,22%)",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
                        }}
                      >
                        Upgrade to Artist Pro to download songs
                        <div
                          className="absolute right-full top-1/2 -translate-y-1/2"
                          style={{
                            width: 0,
                            height: 0,
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

          <div className="ml-auto hidden shrink-0 items-center gap-4 text-[13px] font-medium text-[#8f8f8f] sm:flex">
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
                <polygon points="2,0 14,7 2,14" />
              </svg>
              {plays}
            </span>
            <span className="flex items-center gap-1.5">
              <SiSoundcloud size={14} /> {comments}
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
