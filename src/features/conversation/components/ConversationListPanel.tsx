import { useConversationSummary } from "../hooks/useConversationSummary";
import ConversationListItem from "./ConversationListItem";

function formatTime(isoTimestamp: string): string {
  const messageDate = new Date(isoTimestamp);

  if (Number.isNaN(messageDate.getTime())) {
    return "";
  }

  const elapsedMilliseconds = Date.now() - messageDate.getTime();
  const elapsedMinutes = Math.max(1, Math.floor(elapsedMilliseconds / 60000));

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} minutes ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `${elapsedHours} hours ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays} days ago`;
}

export default function ConversationListPanel() {
  const {
    conversations: conversationList,
    isLoading: isLoadingConversations,
    error: conversationsError,
  } = useConversationSummary();

  return (
    <section className="w-full max-w-[310px]">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <button
          type="button"
          className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-black hover:text-gray-200 hover:cursor-pointer"
        >
          New
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {isLoadingConversations ? <p className="text-sm text-zinc-400">Loading conversations...</p> : null}

        {conversationsError ? <p className="text-sm text-red-400">{conversationsError}</p> : null}

        {!isLoadingConversations && !conversationsError && conversationList.length === 0 ? (
          <p className="text-sm text-zinc-400">No conversations yet.</p>
        ) : null}

        {!isLoadingConversations && !conversationsError
          ? conversationList.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                name={conversation.participant.username}
                preview={conversation.lastMessagePreview}
                timeLabel={formatTime(conversation.lastMessageAt)}
              />
            ))
          : null}
      </div>
    </section>
  );
}
