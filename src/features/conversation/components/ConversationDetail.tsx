import { useEffect, useRef } from "react";
import { useConversationMessages } from "../hooks/useConversationMessages";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import type { ConversationSummary } from "../types";

interface ConversationDetailProps {
  conversation: ConversationSummary | null;
  className?: string;
}

function formatRelativeTime(dateIso: string): string {
  const timestamp = new Date(dateIso).getTime();
  if (Number.isNaN(timestamp)) return "";

  const elapsedMs = Date.now() - timestamp;
  const elapsedMinutes = Math.max(1, Math.floor(elapsedMs / 60000));

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} minute${elapsedMinutes > 1 ? "s" : ""} ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `${elapsedHours} hour${elapsedHours > 1 ? "s" : ""} ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays} day${elapsedDays > 1 ? "s" : ""} ago`;
}

export default function ConversationDetail({ conversation, className = "" }: ConversationDetailProps) {
  const { messages, isLoading, error } = useConversationMessages(
    conversation?.conversationId ?? null,
  );

  const currentUserId = useSelector((state: RootState) => state.user.currentUser?.id ?? "");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  if (!conversation) {
    return (
      <div className={`flex flex-1 flex-col items-center justify-center rounded-md border border-zinc-800 bg-zinc-950 text-center ${className}`}>
        <p className="text-sm text-zinc-400">Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-1 flex-col rounded-md border border-zinc-800 bg-zinc-950 ${className}`}>
      {/* Header */}
      <div className="border-b border-zinc-800 px-4 py-3">
        <h2 className="text-base font-semibold text-white">{conversation.otherUser.displayName}</h2>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading && <p className="text-sm text-zinc-400">Loading messages...</p>}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {!isLoading && !error && messages.length === 0 && (
          <p className="text-center text-sm text-zinc-400">No messages yet</p>
        )}

        <div className="flex flex-col gap-3">
          {!isLoading &&
            !error &&
            messages.map((message) => {
              const isMe = message.senderId === currentUserId;

              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar — received only */}
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

                  {/* Bubble */}
                  <div className={`flex max-w-[70%] flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && (
                      <p className="text-xs text-zinc-400 px-1">{message.sender.displayName}</p>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isMe
                          ? "rounded-br-sm bg-white text-zinc-900"
                          : "rounded-bl-sm bg-zinc-800 text-zinc-100"
                      }`}
                    >
                      {message.content || "[Attachment]"}
                    </div>
                    <p className="px-1 text-xs text-zinc-500">
                      {formatRelativeTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-zinc-800 px-4 py-3">
        <textarea
          placeholder="Write your message..."
          className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
          rows={2}
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <button className="rounded-md bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-600">
            Add track or playlist
          </button>
          <button className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-300">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}