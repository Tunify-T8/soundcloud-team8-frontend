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
} from "lucide-react";
import { SiSoundcloud } from "react-icons/si";
import { Link } from "react-router-dom";
import { waveGenerators } from "../Waveforms";
import { useLike } from "@/features/feed/hooks/useLike";
import { Genre } from "@/shared/types/Genre";
import { usePlayer } from "@/features/playerUI/context/usePlayer";
import CreatePlaylistOverlay from "@/features/library/tabs/playlists/components/CreatePlaylistOverlay";
import trackFallback from "@/assets/track.jpg";

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
  playlistTracks?: Array<{
    id: string;
    number: number;
    title: string;
    artist: string;
    playsCount: number;
    avatarUrl?: string | null;
  }>;
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
  playlistTracks = [],
}: PlayerProps) {
  const { currentTrack, isPlaying, progress: playerProgress, setCurrentTrack, setIsPlaying, requestSeek } = usePlayer();
  const isThisTrack = currentTrack?.id === trackId;
  const playing = isThisTrack && isPlaying;

  const [isWaveHovered, setIsWaveHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPlaylistOverlay, setShowPlaylistOverlay] = useState(false);
  const [randomSeed] = useState(() => Math.random() * 1000000);

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
      });
      setIsPlaying(true);
    }
  };

  const { isLiked, likesCount, toggleLike } = useLike(
    isLikedInitial,
    Number(likes) || 0,
    trackId,
  );

  const GAP = 1;
  const effectiveSeed = waveformSeed || randomSeed;
  const generatorIndex = Math.floor(effectiveSeed) % waveGenerators.length;
  const menuRef = useRef<HTMLDivElement>(null);

  const bars = useMemo((): number[] => {
    return waveGenerators[generatorIndex](effectiveSeed);
  }, [generatorIndex, effectiveSeed]);

  const displayProgress = isThisTrack ? playerProgress : progress;
  const hasPlaylistTracks = playlistTracks.length > 0;
  const cardPrimaryLink = entityLinkTo || (trackId ? `/tracks/${trackId}` : "");
  const mobileCoverSizeClass = smallCoverOnMobile ? "h-[84px] w-[84px]" : "h-[110px] w-[110px]";

  const playPlaylistTrack = (track: {
    id: string;
    title: string;
    artist: string;
  }) => {
    if (!track.id) return;

    const isCurrent = currentTrack?.id === track.id;
    if (isCurrent) {
      setIsPlaying(!isPlaying);
      return;
    }

    setCurrentTrack({
      id: track.id,
      title: track.title,
      artist: track.artist,
      thumbnailUrl: coverUrl || undefined,
      duration: 0,
    });
    setIsPlaying(true);
  };

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

    if (menuOpen) {
      document.addEventListener("mousedown", onClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="flex w-full gap-0 overflow-visible rounded-sm bg-[#0b0b0b] font-sans">
      {/* Cover Art */}
      {cardPrimaryLink ? (
        <Link
          to={cardPrimaryLink}
          className={`relative block shrink-0 bg-[#111] sm:h-[130px] sm:w-[130px] ${mobileCoverSizeClass}`}
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
        <div className={`relative shrink-0 bg-[#111] sm:h-[130px] sm:w-[130px] ${mobileCoverSizeClass}`}>
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
      <div className="flex min-w-0 flex-1 flex-col px-2.5 pb-1.5 pt-0.5 sm:px-4 sm:pb-3 sm:pt-0">
        {/* Top row: play button + artist/title + time/genre */}
        <div className="mb-1 flex flex-wrap items-start gap-2 sm:mb-1 sm:flex-nowrap sm:gap-3">
          <button
            onClick={handlePlayToggle}
            disabled={!trackId}
            className="h-7 w-7 shrink-0 rounded-full bg-white flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed sm:h-9 sm:w-9"
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
            <div className="mb-0.5 truncate text-[9px] text-[hsl(0,0%,50%)] sm:text-[11px]">
              {artistName}
            </div>
            {cardPrimaryLink ? (
              <Link
                to={cardPrimaryLink}
                className="block line-clamp-2 text-[11px] font-medium leading-snug text-white hover:underline sm:text-[13px]"
              >
                {title}
              </Link>
            ) : (
              <p className="line-clamp-2 text-[11px] font-medium leading-snug text-white sm:text-[13px]">
                {title}
              </p>
            )}
          </div>

          <div className="flex w-full items-center gap-1 pl-9 sm:w-auto sm:shrink-0 sm:gap-2 sm:pl-0">
            <span className="whitespace-nowrap text-[9px] text-[hsl(0,0%,40%)] sm:text-[11px]">
              {timeAgo}
            </span>
            <span className="whitespace-nowrap rounded-sm border border-[hsl(0,0%,20%)] bg-[hsl(0,0%,12%)] px-1 py-0.5 text-[8px] text-[hsl(0,0%,55%)] sm:px-2 sm:text-[10px]">
              {contextTag ?? `# ${genre}`}
            </span>
          </div>
        </div>

        {/* Waveform */}
        <div
          className="mb-1 mt-0.5 flex h-[30px] w-full cursor-pointer items-end sm:h-[44px]"
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

        {hasPlaylistTracks && (
          <div className="mb-2 space-y-1.5">
            {playlistTracks.map((track) => (
              <button
                key={track.id}
                type="button"
                onClick={() => playPlaylistTrack(track)}
                className="flex w-full items-center justify-between rounded px-1 py-1 text-left transition-colors hover:bg-[hsl(0,0%,13%)]"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="w-4 shrink-0 text-right text-[13px] text-zinc-400">
                    {track.number}
                  </span>
                  <div className="h-7 w-7 shrink-0 rounded bg-[hsl(0,0%,18%)] flex items-center justify-center">
                    {track.avatarUrl ? (
                      <img
                        src={track.avatarUrl}
                        alt={track.artist}
                        className="h-full w-full rounded object-cover"
                      />
                    ) : (
                      <img
                        src={trackFallback}
                        alt="Track cover fallback"
                        className="h-full w-full rounded object-cover"
                      />
                    )}
                  </div>
                  <p className="truncate text-[13px] text-zinc-200">
                    <span>{track.artist}</span>
                    <span className="text-zinc-500"> · </span>
                    <span className="text-white">{track.title}</span>
                  </p>
                </div>
                <span className="ml-3 hidden shrink-0 items-center gap-1 text-[13px] text-zinc-400 sm:flex">
                  <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor">
                    <polygon points="2,0 14,7 2,14" />
                  </svg>
                  {Intl.NumberFormat("en-US", { notation: "compact" }).format(
                    track.playsCount,
                  )}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Controls row */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 sm:flex-none sm:gap-2">
            <button
              type="button"
              onClick={toggleLike}
              className="flex h-7 w-8 shrink-0 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f] sm:w-9"
              aria-label={`Like (${likesCount})`}
            >
              <Heart
                size={12}
                fill={isLiked ? "#fff" : "none"}
                style={{ color: "#fff" }}
              />
              <span className="sr-only">{likesCount}</span>
            </button>
            <button
              type="button"
              onClick={onToggleRepost}
              disabled={repostDisabled}
              aria-label={isRepostedInitial ? "Undo repost" : "Repost"}
              className="flex h-7 w-8 shrink-0 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f] disabled:cursor-not-allowed disabled:opacity-60 sm:w-9"
            >
              <Repeat2 size={12} style={{ color: "#fff" }} />
              <span className="sr-only">{reposts}</span>
            </button>
            <button className="flex h-7 w-8 shrink-0 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f] sm:w-9">
              <Share2 size={12} />
            </button>
            <button className="flex h-7 w-8 shrink-0 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f] sm:w-9">
              <Copy size={12} />
            </button>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-7 w-8 shrink-0 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f] sm:w-9"
                aria-label="More options"
              >
                <MoreHorizontal size={12} />
              </button>

              {menuOpen && (
                <div className="absolute left-0 top-full mt-1 z-50 min-w-[156px] overflow-hidden rounded-md border border-[hsl(0,0%,18%)] bg-[#0b0b0b] py-0.5 shadow-2xl">
                  <button
                    onClick={() => {
                      onAddToNextUp?.();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[13px] font-semibold text-white hover:text-zinc-500"
                  >
                    <ListMusic
                      size={14}
                      className="text-zinc-300 hover:text-zinc-500"
                    />
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
                    <ListPlus
                      size={14}
                      className="text-zinc-300 hover:text-zinc-500"
                    />
                    Add to Playlist
                  </button>
                  <button
                    onClick={() => {
                      onStation?.();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[13px] font-semibold text-white hover:text-zinc-500"
                  >
                    <Radio
                      size={14}
                      className="text-zinc-300 hover:text-zinc-500"
                    />
                    Station
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 text-[10px] text-[hsl(0,0%,40%)] sm:ml-0 sm:gap-3 sm:text-[11px]">
            <span className="flex items-center gap-1">
              <svg
                width="10"
                height="10"
                viewBox="0 0 14 14"
                fill="currentColor"
              >
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
        track={{
          id: trackId,
          title,
          artist: artistName,
          coverUrl,
        }}
        defaultCoverUrl={coverUrl}
        autoAddTrackId={trackId}
      />
    </div>
  );
}
