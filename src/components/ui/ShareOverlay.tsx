import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { conversationService } from "@/features/conversation/conversationService";
import { socketSingleton } from "@/features/conversation/hooks/useSocket";
import { feedService } from "@/features/feed/feedservice";
import { useDebounce } from "@/hooks/useDebounce";
import type { User } from "@/features/conversation/types";



type ShareOverlayProps = {
  onClose: () => void;
  shareUrl: string;
  track?: {
    id: string;
    title: string;
    artist: string;
    coverUrl?: string | null;
    type?: "TRACK_UPLOAD" | "TRACK_LIKE" | "PLAYLIST" | "ALBUM";
  };
};

function generateTempId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}



function useUserSearch(query: string) {
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    feedService
      .searchPeople(trimmed)
      .then((data) => {
        
        const users: User[] = data.map((item: any) => ({
          id: item.id,
          displayName: item.displayName ?? item.username ?? `User ${item.id.slice(0, 6)}`,
          avatarUrl: item.avatarUrl ?? null,
        }));
        setResults(users.slice(0, 8));
      })
      .catch(() => setResults([]))
      .finally(() => setIsLoading(false));
  }, [debouncedQuery]);

  return { results, isLoading };
}



function MessageTab({
  shareUrl,
  track,
}: {
  shareUrl: string;
  track?: ShareOverlayProps["track"];
}) {
  const [toQuery, setToQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageText, setMessageText] = useState(shareUrl);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  const { results: suggestions, isLoading: searchLoading } = useUserSearch(
    selectedUser ? "" : toQuery,
  );

  async function handleSend() {
    if (!selectedUser) {
      setSendError("Please select a recipient.");
      return;
    }
    if (!messageText.trim() && !track) {
      setSendError("Please write a message or add a track.");
      return;
    }

    setIsSending(true);
    setSendError(null);

    try {
      
      const conversationId = await conversationService.createOrGetConversation(
        selectedUser.id,
      );

      
      if (messageText.trim()) {
        socketSingleton.sendMessage({
          conversationId,
          type: "TEXT",
          content: messageText.trim(),
          tempId: generateTempId(),
        });
      }

     
      if (track) {
        const isTrack =
          !track.type ||
          track.type === "TRACK_UPLOAD" ||
          track.type === "TRACK_LIKE";

        socketSingleton.sendMessage({
          conversationId,
          type: track.type ?? "TRACK_UPLOAD",
          ...(isTrack ? { trackId: track.id } : { collectionId: track.id }),
          tempId: generateTempId(),
        });
      }

      setSendSuccess(true);
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : "Failed to send message.",
      );
    } finally {
      setIsSending(false);
    }
  }

  if (sendSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/15 ring-1 ring-green-500/30">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-6 w-6 text-green-400"
          >
            <polyline
              points="4,10 8,14 16,6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-sm font-semibold text-white">Message sent!</p>
        <p className="text-xs text-zinc-400">
          Your message was sent to{" "}
          <span className="text-zinc-200">{selectedUser?.displayName}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-1">

      {/* ── To field ──────────────────────────────────────────────────────── */}
      <div className="relative">
        <label className="block text-[13px] font-semibold text-zinc-100 mb-1.5">
          To <span className="text-red-500">*</span>
        </label>

        <div className="flex min-h-[38px] flex-wrap items-center gap-2 rounded-[3px] border border-zinc-600 bg-zinc-800 px-3 py-1.5">
          {selectedUser && (
            <span className="flex items-center gap-1 rounded bg-zinc-600 px-2 py-0.5 text-xs text-zinc-100">
              {selectedUser.avatarUrl && (
                <img
                  src={selectedUser.avatarUrl}
                  alt={selectedUser.displayName}
                  className="h-4 w-4 rounded-full object-cover"
                />
              )}
              {selectedUser.displayName}
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="ml-1 text-zinc-400 hover:text-white leading-none"
              >
                ×
              </button>
            </span>
          )}
          {!selectedUser && (
            <input
              type="text"
              value={toQuery}
              onChange={(e) => setToQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
              placeholder="Search for a user…"
              autoComplete="off"
            />
          )}
        </div>

        {/* Loading indicator */}
        {!selectedUser && searchLoading && toQuery.trim().length > 0 && (
          <p className="mt-1 text-xs text-zinc-500">Searching…</p>
        )}

        {/* Suggestions dropdown */}
        {!selectedUser && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 z-20 mt-1 max-h-44 overflow-y-auto rounded-[3px] border border-zinc-600 bg-zinc-800 shadow-2xl">
            {suggestions.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(user);
                    setToQuery("");
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-zinc-100 hover:bg-zinc-700 transition-colors"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-600 text-xs font-semibold uppercase overflow-hidden">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user.displayName.charAt(0)
                    )}
                  </span>
                  <span>{user.displayName}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* No results */}
        {!selectedUser &&
          !searchLoading &&
          toQuery.trim().length > 0 &&
          suggestions.length === 0 && (
            <p className="mt-1 text-xs text-zinc-500">No users found.</p>
          )}
      </div>

      {/* ── Message textarea ───────────────────────────────────────────────── */}
      <div>
        <label className="block text-[13px] font-semibold text-zinc-100 mb-1.5">
          Write your message and add tracks or playlists{" "}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          rows={3}
          className="w-full rounded-[3px] border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 resize-none focus:border-zinc-400 transition-colors"
          placeholder="Add a message…"
        />
      </div>

      {/* ── Track preview ──────────────────────────────────────────────────── */}
      {track && (
        <div className="flex items-center gap-3 rounded-[3px] border border-zinc-700 bg-zinc-800/60 px-3 py-2.5">
          {track.coverUrl ? (
            <img
              src={track.coverUrl}
              alt={track.title}
              className="h-10 w-10 rounded object-cover shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded bg-zinc-700 shrink-0 flex items-center justify-center">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5 text-zinc-500"
              >
                <path d="M18 3a1 1 0 0 0-1.196-.98l-10 2A1 1 0 0 0 6 5v6.499A3.001 3.001 0 1 0 8 14V8.82l8-1.6V11.5A3.001 3.001 0 1 0 18 13V3z" />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-orange-400 uppercase tracking-wide">
              {track.type === "PLAYLIST"
                ? "Playlist"
                : track.type === "ALBUM"
                  ? "Album"
                  : "Track"}
            </p>
            <p className="text-sm font-semibold text-zinc-100 truncate">
              {track.title}
            </p>
            <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
          </div>
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {sendError && <p className="text-xs text-red-400">{sendError}</p>}

      {/* ── Send button ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end pt-1">
        <button
          type="button"
          onClick={handleSend}
          disabled={isSending || !selectedUser}
          className="rounded-[3px] bg-white px-5 py-1.5 text-[13px] font-semibold text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSending ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}



export default function ShareOverlay({
  onClose,
  shareUrl,
  track,
}: ShareOverlayProps) {
  const [activeTab, setActiveTab] = useState<"share" | "message">("share");
  const [shortenLink, setShortenLink] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center bg-white/40 px-4 pt-28"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed right-6 top-6 z-[121] flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
        aria-label="Close share overlay"
        type="button"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        className="w-full max-w-[540px] rounded-[3px] border border-zinc-800 bg-zinc-900 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tabs */}
        <div className="mb-4 flex items-center gap-7 border-b border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab("share")}
            className={`pb-2 text-[20px] font-bold tracking-tight sm:text-[22px] ${
              activeTab === "share"
                ? "border-b-2 border-white text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Share
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("message")}
            className={`pb-2 text-[20px] font-bold tracking-tight sm:text-[22px] ${
              activeTab === "message"
                ? "border-b-2 border-white text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Message
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "share" ? (
          <>
            <div className="mb-3 rounded-[3px] bg-[#242424] px-4 py-3">
              <input
                readOnly
                value={shareUrl}
                className="w-full bg-transparent text-[14px] font-semibold text-zinc-100 outline-none sm:text-[15px]"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-3 text-[14px] font-semibold text-zinc-100 sm:text-[15px]">
              <input
                type="checkbox"
                checked={shortenLink}
                onChange={(e) => setShortenLink(e.target.checked)}
                className="h-5 w-5 rounded border-zinc-500 bg-transparent"
              />
              Shorten link
            </label>
          </>
        ) : (
          <MessageTab shareUrl={shareUrl} track={track} />
        )}
      </div>
    </div>
  );
}
