import { useState } from "react";
import ConversationListPanel from "../components/ConversationListPanel";
import ConversationDetail from "../components/ConversationDetail";
import type { ConversationSummary } from "../types";

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<ConversationSummary | null>(null);

  return (
    <main className="mx-auto flex h-screen w-full max-w-[1400px] gap-4 bg-zinc-950 px-6 py-4">
      <ConversationListPanel
        selectedConversationId={selectedConversation?.conversationId || null}
        onSelectConversation={setSelectedConversation}
      />
      <ConversationDetail conversation={selectedConversation} />
    </main>
  );
}
