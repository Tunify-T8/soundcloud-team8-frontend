import { useRef, useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Message } from "../types";
import { usePlayback } from "../../../hooks/Useplayback";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  onDeleteMessage?: (messageId: string) => void;
  onBlockUser?: (conversationId: string) => void;
}

function formatRelativeTime(dateIso: string): string {
  const timestamp = new Date(dateIso).getTime();
  if (Number.isNaN(timestamp)) return "";
  const elapsedMs = Date.now() - timestamp;
  const elapsedMinutes = Math.max(1, Math.floor(elapsedMs / 60000));
  if (elapsedMinutes < 60) return `${elapsedMinutes} minute${elapsedMinutes > 1 ? "s" : ""} ago`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} hour${elapsedHours > 1 ? "s" : ""} ago`;
  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays} day${elapsedDays > 1 ? "s" : ""} ago`;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

const TRACK_TYPES = new Set(["TRACK_UPLOAD", "TRACK_LIKE"]);
const PLAYLIST_TYPES = new Set(["PLAYLIST", "ALBUM"]);
const ATTACHMENT_TYPES = new Set([...TRACK_TYPES, ...PLAYLIST_TYPES]);

// ─── Three-dot Menu ───────────────────────────────────────────────────────────

function MessageMenu({
  isMe,
  isTemp,
  isHovered,
  onDelete,
  onBlock,
}: {
  isMe: boolean;
  isTemp: boolean;
  isHovered: boolean;
  onDelete?: () => void;
  onBlock?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (isTemp) return null;
  if (!onDelete && !onBlock) return null;

  return (
    <div ref={menuRef} className="relative flex items-center">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{ opacity: isHovered || open ? 1 : 0 }}
        className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-500 transition-opacity duration-150 hover:bg-zinc-700 hover:text-zinc-200 focus:outline-none"
        aria-label="Message options"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
          <circle cx="8" cy="3" r="1.4" />
          <circle cx="8" cy="8" r="1.4" />
          <circle cx="8" cy="13" r="1.4" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute bottom-full mb-1 z-50 min-w-[130px] overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl ${isMe ? "right-0" : "left-0"}`}
        >
          {isMe && onDelete && (
            <button
              type="button"
              onClick={() => { setOpen(false); onDelete(); }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs text-red-400 transition-colors hover:bg-zinc-800 hover:text-red-300"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 shrink-0">
                <polyline points="2,4 14,4" />
                <path d="M5 4V2h6v2" />
                <path d="M3 4l1 10h8l1-10" />
                <line x1="6" y1="7" x2="6" y2="11" />
                <line x1="10" y1="7" x2="10" y2="11" />
              </svg>
              Delete
            </button>
          )}
          {!isMe && onBlock && (
            <button
              type="button"
              onClick={() => { setOpen(false); onBlock(); }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs text-orange-400 transition-colors hover:bg-zinc-800 hover:text-orange-300"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 shrink-0">
                <circle cx="8" cy="8" r="6" />
                <line x1="3.5" y1="3.5" x2="12.5" y2="12.5" />
              </svg>
              Block user
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Track Player ─────────────────────────────────────────────────────────────

function TrackPlayerBubble({
  trackId,
  title,
  artworkUrl,
  isMe,
  isPending,
}: {
  trackId: string;
  title: string;
  artworkUrl?: string | null;
  isMe: boolean;
  isPending?: boolean;
}) {
  const {
    status, bundle, currentTime, duration, buffered,
    previewSecondsRemaining, play, pause, seek, audioRef,
  } = usePlayback({ trackId, autoPlay: false });

  const progressRef = useRef<HTMLDivElement>(null);

  const isPlaying = status === "playing";
  const isLoading = status === "loading";
  const isBlocked = status === "blocked";
  const isError = status === "error";
  const isPreview = status === "preview" || bundle?.playability.status === "preview";

  const displayTitle = bundle?.title ?? title;
  const displayArtist = bundle?.artist.name ?? "";
  const cover = bundle?.coverUrl ?? artworkUrl ?? null;
  const totalDuration = duration || bundle?.durationSeconds || 0;
  const progress = totalDuration > 0 ? currentTime / totalDuration : 0;

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || totalDuration === 0) return;
      const rect = progressRef.current.getBoundingClientRect();
      const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      seek(ratio * totalDuration);
    },
    [seek, totalDuration],
  );

  const bubbleBase = isMe ? "bg-white text-zinc-900" : "bg-zinc-800 text-zinc-100";
  const subTextColor = isMe ? "text-zinc-500" : "text-zinc-400";
  const progressBg = isMe ? "bg-zinc-200" : "bg-zinc-700";
  const progressFill = isMe ? "bg-zinc-800" : "bg-orange-500";
  const bufferedFill = isMe ? "bg-zinc-300" : "bg-zinc-600";

  return (
    <div className={`rounded-2xl ${isMe ? "rounded-br-sm" : "rounded-bl-sm"} px-3 py-3 w-64 ${bubbleBase} transition-opacity ${isPending ? "opacity-60" : "opacity-100"}`}>
      <audio ref={audioRef} preload="none" className="hidden" />
      <div className="flex items-center gap-2.5">
        {cover ? (
          <img src={cover} alt={displayTitle} className="h-10 w-10 shrink-0 rounded object-cover" />
        ) : (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded text-lg ${isMe ? "bg-zinc-200" : "bg-zinc-700"}`}>🎵</div>
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5 ${subTextColor}`}>
            {isPreview ? "Preview" : "Track"}
          </p>
          <p className="text-xs font-semibold truncate leading-snug">{displayTitle}</p>
          {displayArtist && <p className={`text-xs truncate ${subTextColor}`}>{displayArtist}</p>}
        </div>
        <button
          type="button"
          onClick={isPlaying ? pause : play}
          disabled={isBlocked || isError || isPending}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${isMe ? "bg-zinc-900 text-white hover:bg-zinc-700" : "bg-orange-500 text-white hover:bg-orange-400"}`}
          title={isBlocked ? "Track unavailable" : isPlaying ? "Pause" : "Play"}
        >
          {isLoading ? (
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : isPlaying ? (
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5 translate-x-px" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      {!isBlocked && !isError && (
        <div className="mt-2.5">
          <div
            ref={progressRef}
            onClick={handleSeek}
            className={`relative h-1 w-full rounded-full cursor-pointer ${progressBg}`}
          >
            <div className={`absolute inset-y-0 left-0 rounded-full ${bufferedFill}`} style={{ width: `${buffered * 100}%` }} />
            <div className={`absolute inset-y-0 left-0 rounded-full ${progressFill}`} style={{ width: `${progress * 100}%` }} />
          </div>
          <div className={`mt-1 flex justify-between text-[10px] ${subTextColor}`}>
            <span>{formatTime(currentTime)}</span>
            {isPreview && previewSecondsRemaining !== null ? (
              <span>Preview · {formatTime(previewSecondsRemaining)} left</span>
            ) : (
              <span>{formatTime(totalDuration)}</span>
            )}
          </div>
        </div>
      )}

      {(isBlocked || isError) && (
        <p className={`mt-1.5 text-[10px] ${subTextColor}`}>
          {isBlocked ? "This track is unavailable" : "Failed to load track"}
        </p>
      )}
    </div>
  );
}

// ─── Playlist / Album Bubble ──────────────────────────────────────────────────

function PlaylistBubble({
  collectionId,
  title,
  coverUrl,
  type,
  isMe,
  isPending,
}: {
  collectionId: string | null;
  title: string;
  coverUrl?: string | null;
  type: "PLAYLIST" | "ALBUM";
  isMe: boolean;
  isPending?: boolean;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!collectionId || isPending) return;
    navigate(`/collections/${collectionId}`);
  };

  const bubbleBase = isMe ? "bg-white text-zinc-900" : "bg-zinc-800 text-zinc-100";
  const subTextColor = isMe ? "text-zinc-500" : "text-zinc-400";
  const placeholderBg = isMe ? "bg-zinc-200" : "bg-zinc-700";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!collectionId || isPending}
      className={`
        rounded-2xl ${isMe ? "rounded-br-sm" : "rounded-bl-sm"}
        px-3 py-2.5 flex items-center gap-3 w-64
        ${bubbleBase}
        transition-opacity ${isPending ? "opacity-60" : "opacity-100"}
        ${collectionId && !isPending ? "cursor-pointer hover:opacity-80" : "cursor-default"}
        text-left
      `}
    >
      {coverUrl ? (
        <img src={coverUrl} alt={title} className="h-10 w-10 shrink-0 rounded object-cover" />
      ) : (
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded text-lg ${placeholderBg}`}>
          🎶
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5 ${subTextColor}`}>
          {type === "ALBUM" ? "Album" : "Playlist"}
        </p>
        <p className="text-xs font-semibold truncate max-w-[160px]">{title}</p>
        {collectionId && !isPending && (
          <p className={`text-[10px] mt-0.5 ${subTextColor}`}>Tap to open →</p>
        )}
      </div>
    </button>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function MessageBubble({
  message,
  isMe,
  onDeleteMessage,
  onBlockUser,
}: MessageBubbleProps) {
  const isTemp = message.id.startsWith("temp-");
  const isTrack = TRACK_TYPES.has(message.type);
  const isPlaylist = PLAYLIST_TYPES.has(message.type);
  const isAttachment = ATTACHMENT_TYPES.has(message.type);

  const preview = message.attachment?.preview as Record<string, unknown> | null | undefined;

  // Tracks use artworkUrl, playlists/albums use coverUrl
  const artworkUrl =
    (preview?.artworkUrl as string | null | undefined) ??
    (preview?.coverUrl as string | null | undefined) ??
    null;

  // Title from preview
  const attachmentTitle =
    (preview?.title as string | null | undefined) ??
    message.content ??
    (isPlaylist ? (message.type === "ALBUM" ? "Album" : "Playlist") : "Track");

  const attachmentId = message.attachment?.id ?? null;

  const handleDelete = onDeleteMessage ? () => onDeleteMessage(message.id) : undefined;
  const handleBlock = onBlockUser ? () => onBlockUser(message.conversationId) : undefined;

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isMe && (
        message.sender.avatarUrl ? (
          <img
            src={message.sender.avatarUrl}
            alt={message.sender.displayName}
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-600 text-xs font-semibold text-zinc-100">
            {message.sender.displayName?.charAt(0).toUpperCase() ?? "U"}
          </div>
        )
      )}

      <div className={`flex max-w-[75%] flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
        {!isMe && (
          <p className="px-1 text-xs text-zinc-400">{message.sender.displayName}</p>
        )}

        <div className={`flex items-end gap-1.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
          {isTrack && attachmentId ? (
            <TrackPlayerBubble
              trackId={attachmentId}
              title={attachmentTitle}
              artworkUrl={artworkUrl}
              isMe={isMe}
              isPending={isTemp || message.isPending}
            />
          ) : isPlaylist ? (
            <PlaylistBubble
              collectionId={attachmentId}
              title={attachmentTitle}
              coverUrl={artworkUrl}
              type={message.type as "PLAYLIST" | "ALBUM"}
              isMe={isMe}
              isPending={isTemp || message.isPending}
            />
          ) : isAttachment ? (
            <div className={`rounded-2xl ${isMe ? "rounded-br-sm bg-white text-zinc-900" : "rounded-bl-sm bg-zinc-800 text-zinc-100"} px-4 py-2.5 text-sm transition-opacity ${isTemp ? "opacity-60" : "opacity-100"}`}>
              {message.content || "[Attachment]"}
            </div>
          ) : (
            <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isMe ? "rounded-br-sm bg-white text-zinc-900" : "rounded-bl-sm bg-zinc-800 text-zinc-100"} transition-opacity ${isTemp ? "opacity-60" : "opacity-100"}`}>
              {message.content || "[Attachment]"}
            </div>
          )}

          <MessageMenu
            isMe={isMe}
            isTemp={isTemp}
            isHovered={isHovered}
            onDelete={handleDelete}
            onBlock={handleBlock}
          />
        </div>

        <p className="px-1 text-xs text-zinc-500">
          {isTemp ? "Sending..." : formatRelativeTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
