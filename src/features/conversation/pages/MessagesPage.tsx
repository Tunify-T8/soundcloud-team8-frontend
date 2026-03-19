import { useState } from "react";
import ConversationListPanel from "../components/ConversationListPanel";
import ConversationDetail from "../components/ConversationDetail";
import type { ConversationSummary } from "../types";

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<ConversationSummary | null>(null);

  return (
    <main className="flex h-screen w-full justify-center gap-4 bg-zinc-950 px-4 py-4">
      <ConversationListPanel
        selectedConversationId={selectedConversation?.conversationId || null}
        onSelectConversation={setSelectedConversation}
      />
      <ConversationDetail conversation={selectedConversation} className="max-w-3xl" />
    </main>
  );
}
