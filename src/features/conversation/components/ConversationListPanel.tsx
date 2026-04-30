import { useState } from "react";
import ConversationListItem from "./ConversationListItem";
import NewMessageDialog from "./NewMessageDialog";
import type { ConversationSummary } from "../types";

interface ConversationListPanelProps {
  selectedConversationId: string | null;
  onSelectConversation: (conversation: ConversationSummary) => void;
  onConversationCreated?: (conversationId: string) => void;
  conversations: ConversationSummary[];
  isLoading: boolean;
  error: string | null;
}

function formatTime(isoTimestamp: string): string {
  const messageDate = new Date(isoTimestamp);
  if (Number.isNaN(messageDate.getTime())) return "";

  const elapsedMilliseconds = Date.now() - messageDate.getTime();
  const minutes = Math.max(1, Math.floor(elapsedMilliseconds / 60000));

  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const elapsedHours = Math.floor(minutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} hour${elapsedHours > 1 ? "s" : ""} ago`;
  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays} day${elapsedDays > 1 ? "s" : ""} ago`;
}

export default function ConversationListPanel({
  selectedConversationId,
  onSelectConversation,
  onConversationCreated,
  conversations,
  isLoading,
  error,
}: ConversationListPanelProps) {
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false);

  return (
    <section className="w-96 shrink-0 rounded-md border border-zinc-800 bg-zinc-950 p-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Messages</h1>
        <button
          type="button"
          onClick={() => setIsNewMessageDialogOpen(true)}
          className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-black hover:text-gray-200 hover:cursor-pointer"
        >
          New
        </button>
      </div>

      <NewMessageDialog
        isOpen={isNewMessageDialogOpen}
        onClose={() => setIsNewMessageDialogOpen(false)}
        onConversationCreated={onConversationCreated}
      />

      <div className="mt-4 flex flex-col gap-2">
        {isLoading && <p className="text-sm text-zinc-400">Loading conversations...</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {!isLoading && !error && conversations.length === 0 && (
          <p className="text-sm text-zinc-400">No conversations yet.</p>
        )}
        {!isLoading &&
          !error &&
          conversations.map((conversation) => (
            <div
              key={conversation.conversationId}
              className={`rounded-md p-2 cursor-pointer transition ${
                selectedConversationId === conversation.conversationId
                  ? "bg-zinc-800"
                  : "hover:bg-zinc-900"
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <ConversationListItem
                name={conversation.otherUser.displayName}
                preview={conversation.lastMessagePreview ?? ""}
                timeLabel={formatTime(conversation.lastMessageAt ?? "")}
                unreadCount={conversation.unreadCount}
                avatarUrl={conversation.otherUser.avatarUrl}
              />
            </div>
          ))}
      </div>
    </section>
  );
}