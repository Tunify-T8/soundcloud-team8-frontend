import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useConversationMessages } from "../hooks/useConversationMessages";
import { useSocket } from "../hooks/useSocket";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import type { Message, MessageType } from "../types";
import MessageBubble from "./MessageBubble";
import AttachmentPicker from "./AttachmentPicker";
import type { AttachmentOption } from "../hooks/useAttachmentPicker";
import { conversationService } from "../conversationService";

function generateTempId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ─── Block Confirmation Modal ─────────────────────────────────────────────────

function BlockConfirmModal({
  onConfirm,
  onCancel,
  isBlocking,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isBlocking: boolean;
}) {
  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        {/* Icon */}
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-orange-500/10 ring-1 ring-orange-500/30">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-orange-400">
            <circle cx="10" cy="10" r="7.5" />
            <line x1="4.4" y1="4.4" x2="15.6" y2="15.6" />
          </svg>
        </div>

        <h3 className="text-sm font-semibold text-white">Block this user?</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
          They won't be able to message you and you won't see their messages. You can unblock them later from your settings.
        </p>

        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isBlocking}
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBlocking}
            className="flex-1 rounded-xl bg-orange-500 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-400 disabled:opacity-50"
          >
            {isBlocking ? "Blocking…" : "Block user"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Chat Window ──────────────────────────────────────────────────────────────

type ChatWindowProps = {
  conversationId?: string | null;
};

export default function ChatWindow({ conversationId: conversationIdProp }: ChatWindowProps) {
  const { conversationId: routeConversationId } = useParams<{ conversationId: string }>();
  const conversationId = conversationIdProp ?? routeConversationId ?? null;
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const currentUserId = currentUser?.id ?? "";

  const {
    messages,
    isLoading,
    error,
    hasNextPage,
    loadEarlier,
    appendMessage,
    confirmLatestMessage,
  } = useConversationMessages(conversationId ?? null);

  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showAttachPicker, setShowAttachPicker] = useState(false);
  const [attachmentDraft, setAttachmentDraft] = useState<AttachmentOption | null>(null);

  // Local deleted message IDs (frontend-only)
  const [deletedMessageIds, setDeletedMessageIds] = useState<Set<string>>(new Set());

  // Block modal state
  const [blockTargetConvId, setBlockTargetConvId] = useState<string | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleMessageReceived = useCallback(
    (message: Message) => {
      if (message.senderId !== currentUserId) {
        appendMessage(message);
      }
    },
    [appendMessage, currentUserId],
  );

  const handleMessageSent = useCallback(
    (messageId: string, _tempId: string) => {
      setIsSending(false);
      confirmLatestMessage(messageId);
    },
    [confirmLatestMessage],
  );

  const handleTypingActive = useCallback(
    ({ userId }: { conversationId: string; userId: string }) => {
      if (userId !== currentUserId) setOtherUserTyping(true);
    },
    [currentUserId],
  );

  const handleTypingInactive = useCallback(
    ({ userId }: { conversationId: string; userId: string }) => {
      if (userId !== currentUserId) setOtherUserTyping(false);
    },
    [currentUserId],
  );

  const { sendMessage, emitTypingStart, emitTypingStop } = useSocket({
    conversationId: conversationId ?? null,
    onMessageReceived: handleMessageReceived,
    onMessageSent: handleMessageSent,
    onTypingActive: handleTypingActive,
    onTypingInactive: handleTypingInactive,
  });

  const displayedMessages = [...messages]
    .filter((m) => !deletedMessageIds.has(m.id))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  useEffect(() => {
    if (!isLoading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayedMessages.length, isLoading]);

  // ── Delete message (own, frontend-only) ────────────────────────────────────
  const handleDeleteMessage = useCallback((messageId: string) => {
    setDeletedMessageIds((prev) => new Set(prev).add(messageId));
  }, []);

  // ── Block user ─────────────────────────────────────────────────────────────
  const handleRequestBlock = useCallback((convId: string) => {
    setBlockError(null);
    setBlockTargetConvId(convId);
  }, []);

  const handleConfirmBlock = useCallback(async () => {
    if (!blockTargetConvId) return;
    setIsBlocking(true);
    setBlockError(null);
    try {
      await conversationService.blockUser(blockTargetConvId);
      setBlockTargetConvId(null);
      // Optionally: navigate away or show a toast here
    } catch {
      setBlockError("Failed to block user. Please try again.");
    } finally {
      setIsBlocking(false);
    }
  }, [blockTargetConvId]);

  const handleCancelBlock = useCallback(() => {
    setBlockTargetConvId(null);
    setBlockError(null);
  }, []);

  // ── Attachment ─────────────────────────────────────────────────────────────
  const handleAttachmentSelect = (option: AttachmentOption) => {
    setAttachmentDraft(option);
    setShowAttachPicker(false);
  };

  // ── Send ───────────────────────────────────────────────────────────────────
  const handleSendMessage = () => {
    if (!conversationId || isSending) return;

    if (attachmentDraft) {
      const tempId = generateTempId();
      const isTrack =
        attachmentDraft.type === "TRACK_UPLOAD" ||
        attachmentDraft.type === "TRACK_LIKE";
      const isCollection =
        attachmentDraft.type === "PLAYLIST" ||
        attachmentDraft.type === "ALBUM";

      const optimisticMessage: Message = {
        id: tempId,
        conversationId,
        senderId: currentUserId,
        sender: {
          id: currentUserId,
          displayName:
            (currentUser as any)?.displayName ?? currentUser?.username ?? "Me",
          avatarUrl: currentUser?.avatarUrl ?? null,
        },
        type: attachmentDraft.type as MessageType,
        content: attachmentDraft.title,
        read: false,
        createdAt: new Date().toISOString(),
        attachment: {
          id: attachmentDraft.id,
          type: attachmentDraft.type as MessageType,
          preview: {
            title: attachmentDraft.title,
            coverUrl: attachmentDraft.coverUrl,
            artworkUrl: attachmentDraft.coverUrl,
          },
        },
      };

      appendMessage(optimisticMessage);
      setIsSending(true);

      if (isTrack) {
        sendMessage({
          conversationId,
          type: attachmentDraft.type as MessageType,
          trackId: attachmentDraft.id,
          tempId,
        });
      } else if (isCollection) {
        sendMessage({
          conversationId,
          type: attachmentDraft.type as MessageType,
          collectionId: attachmentDraft.id,
          tempId,
        });
      }

      setAttachmentDraft(null);
      setTimeout(() => setIsSending(false), 5000);
      return;
    }

    if (!messageInput.trim()) return;

    const tempId = generateTempId();
    const content = messageInput.trim();

    const optimisticMessage: Message = {
      id: tempId,
      conversationId,
      senderId: currentUserId,
      sender: {
        id: currentUserId,
        displayName:
          (currentUser as any)?.displayName ?? currentUser?.username ?? "Me",
        avatarUrl: currentUser?.avatarUrl ?? null,
      },
      type: "TEXT",
      content,
      read: false,
      createdAt: new Date().toISOString(),
    };

    appendMessage(optimisticMessage);
    setMessageInput("");
    setIsSending(true);

    sendMessage({ conversationId, type: "TEXT", content, tempId });

    if (isTypingRef.current) {
      emitTypingStop(conversationId);
      isTypingRef.current = false;
    }

    setTimeout(() => setIsSending(false), 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    if (!conversationId) return;

    if (!isTypingRef.current) {
      emitTypingStart(conversationId);
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop(conversationId);
      isTypingRef.current = false;
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversationId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-zinc-800 bg-zinc-950 text-center">
        <p className="text-sm text-zinc-400">Invalid conversation ID</p>
      </div>
    );
  }

  return (
    <>
      {/* Block confirmation modal */}
      {blockTargetConvId && (
        <BlockConfirmModal
          onConfirm={handleConfirmBlock}
          onCancel={handleCancelBlock}
          isBlocking={isBlocking}
        />
      )}

      <div className="flex flex-1 flex-col rounded-md border border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
          <h2 className="text-base font-semibold text-white">
            Conversation {conversationId}
          </h2>
          <button
            type="button"
            onClick={() => setBlockTargetConvId(conversationId)}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-orange-400 transition-colors hover:bg-zinc-800 hover:text-orange-300"
          >
            Block user
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading && messages.length === 0 && (
            <p className="text-sm text-zinc-400">Loading messages...</p>
          )}
          {error && messages.length === 0 && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          {messages.length === 0 && !isLoading && !error && (
            <p className="text-center text-sm text-zinc-400">
              No messages yet. Start the conversation!
            </p>
          )}

          {hasNextPage && (
            <div className="mb-4 text-center">
              <button
                type="button"
                onClick={loadEarlier}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                Load earlier messages
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {displayedMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isMe={message.senderId === currentUserId}
                onDeleteMessage={
                  message.senderId === currentUserId
                    ? handleDeleteMessage
                    : undefined
                }
                onBlockUser={
                  message.senderId !== currentUserId
                    ? handleRequestBlock
                    : undefined
                }
              />
            ))}
          </div>

          {otherUserTyping && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-600 text-xs text-zinc-100">
                ...
              </div>
              <div className="rounded-2xl rounded-bl-sm bg-zinc-800 px-4 py-2.5 text-sm text-zinc-400">
                typing…
              </div>
            </div>
          )}

          {blockError && (
            <p className="mt-2 text-center text-xs text-red-400">{blockError}</p>
          )}

          <div ref={bottomRef} />
        </div>

        {showAttachPicker && (
          <AttachmentPicker
            onSelect={handleAttachmentSelect}
            onClose={() => setShowAttachPicker(false)}
          />
        )}

        {attachmentDraft && !showAttachPicker && (
          <div className="border-t border-zinc-700 bg-zinc-900 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {attachmentDraft.coverUrl && (
                <img
                  src={attachmentDraft.coverUrl}
                  alt={attachmentDraft.title}
                  className="h-8 w-8 rounded object-cover"
                />
              )}
              <div>
                <p className="text-xs font-semibold text-orange-400 uppercase">
                  {attachmentDraft.type === "PLAYLIST"
                    ? "Playlist"
                    : attachmentDraft.type === "ALBUM"
                    ? "Album"
                    : "Track"}
                </p>
                <p className="text-xs text-zinc-300">{attachmentDraft.title}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachmentDraft(null)}
              className="text-xs text-zinc-500 hover:text-zinc-200"
            >
              Remove
            </button>
          </div>
        )}

        <div className="border-t border-zinc-800 px-4 py-3">
          <textarea
            value={messageInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={
              attachmentDraft
                ? "Add a message (optional)..."
                : "Write your message..."
            }
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
            rows={2}
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowAttachPicker((prev) => !prev)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                showAttachPicker || attachmentDraft
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-700 text-white hover:bg-zinc-600"
              }`}
            >
              {attachmentDraft ? "Attachment added ✓" : "Add track or playlist"}
            </button>
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={(!messageInput.trim() && !attachmentDraft) || isSending}
              className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
