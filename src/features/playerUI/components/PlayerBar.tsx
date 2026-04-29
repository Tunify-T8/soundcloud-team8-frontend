import {
  Heart,
  Shuffle,
  Repeat2,
  Volume2,
  VolumeX,
  UserPlus2,
  LayoutList,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { usePlayback } from "@/hooks/Useplayback";
import { useQueue } from "@/hooks/useQueue";
import { usePlayer } from "@/features/playerUI/context/usePlayer";
import NextUpPanel from "./NextUpPanel";

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying: contextIsPlaying,
    pendingSeek,
    setIsPlaying,
    setProgress,
    requestSeek,
    clearPendingSeek,
  } = usePlayer();

  const trackId      = currentTrack?.id      ?? "";
  const trackTitle   = currentTrack?.title   ?? "";
  const trackArtist  = currentTrack?.artist  ?? "";
  const thumbnailUrl = currentTrack?.thumbnailUrl;
  const offlineSrc   = currentTrack?.offlineSrc;

  const {
    status,
    currentTime,
    duration,
    volume,
    isMuted,
    buffered,
    play,
    pause,
    seek,
    setVolume,
    toggleMute,
    audioRef,
  } = usePlayback({ trackId, autoPlay: false, offlineSrc });

  const isPlaying = status === "playing";
  const uiIsPlaying = contextIsPlaying || isPlaying;

  useEffect(() => {
    if (!trackId) return;
    if (contextIsPlaying) {
      if (status === "paused") play();
    } else if (status === "playing") {
      pause();
    }
  }, [contextIsPlaying, trackId, play, pause]);

  useEffect(() => {
    if (!trackId) return;
    if (contextIsPlaying && status === "ready") play();
  }, [contextIsPlaying, status, trackId, play]);

  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    if (
      (status === "paused" || status === "idle" || status === "blocked" || status === "error") &&
      prevStatus === "playing" &&
      contextIsPlaying
    ) {
      setIsPlaying(false);
    }
    prevStatusRef.current = status;
  }, [status, contextIsPlaying, setIsPlaying]);

  useEffect(() => {
    const nextProgress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
    setProgress(nextProgress);
  }, [currentTime, duration, setProgress]);

  useEffect(() => {
    if (!pendingSeek || pendingSeek.trackId !== trackId || duration <= 0) return;
    if (status !== "ready" && status !== "playing" && status !== "paused") return;
    seek(pendingSeek.progress * duration);
    clearPendingSeek();
  }, [pendingSeek, trackId, duration, status, seek, clearPendingSeek]);

  const [showVolume,  setShowVolume]  = useState(false);
  const [isDragging,  setIsDragging]  = useState(false);
  const [showNextUp,  setShowNextUp]  = useState(false);
  const [hoverQueue,  setHoverQueue]  = useState(false);

  const hideTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPlayingRef  = useRef(isPlaying);
  const prevStatusRef = useRef(status);

  const { next, prev, shuffle, repeat, toggleShuffle, toggleRepeat, loadQueue } = useQueue();

  useEffect(() => {
    loadQueue({ contextType: "playlist", contextId: "playlist-1", shuffle: false, repeat: "none" });
  }, []);

  useEffect(() => {
    isPlayingRef.current = uiIsPlaying;
  }, [uiIsPlaying]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setIsPlaying(!isPlayingRef.current);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsPlaying]);

  if (!currentTrack) return null;

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = 1 - (e.clientY - rect.top) / rect.height;
    const newVol = Math.max(0, Math.min(1, pct));
    setVolume(newVol);
    if (newVol < 0.01 && !isMuted) toggleMute();
    if (newVol >= 0.01 && isMuted)  toggleMute();
  };

  const handleMouseEnter = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowVolume(true);
  };

  const handleMouseLeave = () => {
    hideTimer.current = setTimeout(() => {
      setShowVolume(false);
      setIsDragging(false);
    }, 300);
  };

  const progressPct = Math.min(100, Math.max(0, duration > 0 ? (currentTime / duration) * 100 : 0));
  const bufferedPct = Math.min(100, Math.max(0, buffered * 100));

  const handlePlayPause = () => setIsPlaying(!uiIsPlaying);

  return (
    <>
      <audio ref={audioRef} data-testid="player-audio-element" style={{ display: "none" }} />

      <NextUpPanel isOpen={showNextUp} onClose={() => setShowNextUp(false)} />

      <div data-testid="player-bar" className="fixed bottom-0 left-0 right-0 h-12 bg-[#222] border-t border-zinc-700 z-50 flex items-center justify-center px-6 gap-5">

        {/* Playback controls */}
        <div data-testid="player-controls" className="flex items-center gap-4 shrink-0">
          <svg
            data-testid="player-prev-button"
            width="16" height="16" viewBox="0 0 16 16" fill="white"
            className="cursor-pointer hover:opacity-70"
            onClick={prev}
          >
            <rect x="0" y="0" width="2.5" height="16" />
            <polygon points="14,0 3,8 14,16" />
          </svg>

          <button
            data-testid="player-play-pause-button"
            data-playing={uiIsPlaying}
            onClick={handlePlayPause}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
            aria-label={uiIsPlaying ? "Pause" : "Play"}
          >
            {uiIsPlaying ? (
              <svg data-testid="player-pause-icon" width="14" height="14" viewBox="0 0 14 14" fill="black">
                <rect x="1" y="1" width="4" height="12" />
                <rect x="9" y="1" width="4" height="12" />
              </svg>
            ) : (
              <svg data-testid="player-play-icon" width="14" height="14" viewBox="0 0 14 14" fill="black">
                <polygon points="2,0 16,7 2,14" />
              </svg>
            )}
          </button>

          <svg
            data-testid="player-next-button"
            width="16" height="16" viewBox="0 0 16 16" fill="white"
            className="cursor-pointer hover:opacity-70"
            onClick={next}
          >
            <rect x="13.5" y="0" width="2.5" height="16" />
            <polygon points="2,0 13,8 2,16" />
          </svg>

          <Shuffle
            data-testid="player-shuffle-button"
            data-active={shuffle}
            size={15}
            className="cursor-pointer transition-colors"
            style={{ color: shuffle ? "#FF5500" : "#71717a" }}
            onClick={toggleShuffle}
          />
          <Repeat2
            data-testid="player-repeat-button"
            data-repeat-mode={repeat}
            size={15}
            className="cursor-pointer transition-colors"
            style={{ color: repeat !== "none" ? "#FF5500" : "#71717a" }}
            onClick={toggleRepeat}
          />
        </div>

        {/* Progress bar + times */}
        <div data-testid="player-progress-section" className="flex items-center gap-2 shrink-0" style={{ width: "378px" }}>
          <span data-testid="player-current-time" className="text-xs font-bold text-white shrink-0 tracking-tight">
            {formatTime(currentTime)}
          </span>

          <div
            data-testid="player-progress-bar"
            className="relative flex-1 h-[3px] bg-zinc-600 rounded-full cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct  = (e.clientX - rect.left) / rect.width;
              requestSeek(trackId, pct);
            }}
          >
            <div data-testid="player-buffered-bar" className="absolute left-0 top-0 h-full bg-zinc-500 rounded-full" style={{ width: `${bufferedPct}%` }} />
            <div data-testid="player-played-bar" className="absolute left-0 top-0 h-full bg-orange-500 rounded-full" style={{ width: `${progressPct}%` }} />
            <div
              data-testid="player-progress-thumb"
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `clamp(0px, calc(${progressPct}% - 5px), calc(100% - 10px))` }}
            />
          </div>

          <span data-testid="player-duration" className="text-xs font-bold text-white shrink-0 tracking-tight">
            {formatTime(duration)}
          </span>
        </div>

        {/* Volume */}
        <div
          data-testid="player-volume-control"
          className="relative shrink-0"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {showVolume && (
            <div
              data-testid="player-volume-slider-popup"
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#2a2a2a] rounded-lg px-3 pt-3 pb-2 flex flex-col items-center shadow-xl"
              style={{ height: "110px" }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={(e) => { if (isDragging) handleVolumeChange(e); }}
              onMouseUp={() => setIsDragging(false)}
            >
              <div
                data-testid="player-volume-slider-track"
                className="relative bg-zinc-600 rounded-full cursor-pointer flex-1"
                style={{ width: "3px" }}
                onMouseDown={(e) => { setIsDragging(true); handleVolumeChange(e); }}
              >
                <div data-testid="player-volume-fill" className="absolute bottom-0 left-0 w-full bg-white rounded-full" style={{ height: `${volume * 100}%` }} />
                <div
                  data-testid="player-volume-thumb"
                  className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-black border border-white rounded-full shadow"
                  style={{ bottom: `calc(${volume * 100}% - 6px)` }}
                />
              </div>
            </div>
          )}

          <button
            data-testid="player-mute-button"
            data-muted={isMuted}
            onClick={toggleMute}
            className="text-white hover:text-zinc-300 cursor-pointer"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>

        {/* Track info */}
        <div data-testid="player-track-info" className="flex items-center gap-2 shrink-0">
          {thumbnailUrl && (
            <img data-testid="player-track-thumbnail" src={thumbnailUrl} alt="cover" className="w-8 h-8 object-cover" />
          )}
          <div className="flex flex-col leading-tight">
            <span data-testid="player-track-artist" className="text-xs text-zinc-400 leading-none font-bold tracking-tight">{trackArtist}</span>
            <span data-testid="player-track-title" className="text-xs font-bold text-white leading-none mt-0.5">{trackTitle}</span>
          </div>
        </div>

        {/* Right-side actions */}
        <div data-testid="player-actions" className="flex items-center gap-4 shrink-0">
          <Heart
            data-testid="player-like-button"
            size={15}
            fill="#FF5500"
            className="cursor-pointer hover:opacity-80"
            style={{ color: "#FF5500" }}
          />
          <UserPlus2
            data-testid="player-follow-button"
            size={15}
            className="cursor-pointer hover:opacity-80"
            style={{ color: "#FF5500" }}
          />

          <button
            data-testid="player-next-up-button"
            data-open={showNextUp}
            onClick={() => setShowNextUp((v) => !v)}
            onMouseEnter={() => setHoverQueue(true)}
            onMouseLeave={() => setHoverQueue(false)}
            className="cursor-pointer transition-colors"
            aria-label="Next up"
          >
            <LayoutList
              size={15}
              style={{ color: showNextUp ? "#FF5500" : hoverQueue ? "#9ca3af" : "white" }}
            />
          </button>
        </div>

      </div>
    </>
  );
}
