import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useConversationSummary } from "../hooks/useConversationSummary";
import ConversationListPanel from "../components/ConversationListPanel";
import ChatWindow from "../components/ChatWindow";
import type { ConversationSummary } from "../types";
import { conversationService } from "../conversationService";
import type { RootState } from "../../../app/store";

export default function MessagesPage() {
  const { conversationId: routeConversationId } = useParams<{ conversationId: string }>();
  const currentUserId = useSelector(
    (state: RootState) => state.user.currentUser?.id ?? null,
  );
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    routeConversationId ?? null,
  );
  const previousRouteConversationId = useRef<string | null>(routeConversationId ?? null);

  const {
    conversations,
    setConversations,
    isLoading,
    error,
    refetch,
  } = useConversationSummary(currentUserId, selectedConversationId);

  const selectedConversation =
    conversations.find((c) => c.conversationId === selectedConversationId) ?? null;

  const redirectedForRef = useRef<string | null>(null);
  const markedReadRef = useRef<string | null>(null);

  // When MessagesPage unmounts (user navigates away), tell navbar to re-sync
  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent("messages:refetch"));
    };
  }, []);

  useEffect(() => {
    if (routeConversationId === previousRouteConversationId.current) return;
    previousRouteConversationId.current = routeConversationId ?? null;
    setSelectedConversationId(routeConversationId ?? null);
  }, [routeConversationId]);

  useEffect(() => {
    if (
      routeConversationId &&
      !isLoading &&
      conversations.length > 0 &&
      !selectedConversation &&
      redirectedForRef.current !== routeConversationId
    ) {
      redirectedForRef.current = routeConversationId;
      setSelectedConversationId(null);
    }
  }, [routeConversationId, isLoading, conversations.length, selectedConversation]);

  // Mark as read on initial load or refresh — fires when conversation loads
  useEffect(() => {
    if (!selectedConversationId || !selectedConversation) return;
    if (markedReadRef.current === selectedConversationId) return;

    markedReadRef.current = selectedConversationId;

    const unreadToDeduct = selectedConversation.unreadCount;

    if (unreadToDeduct > 0) {
      // Update local state
      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === selectedConversationId ? { ...c, unreadCount: 0 } : c,
        ),
      );

      // Tell navbar to deduct
      window.dispatchEvent(
        new CustomEvent("messages:read", { detail: { deduct: unreadToDeduct } }),
      );

      // Mark on server
      conversationService.markConversationAsRead(selectedConversationId).catch(() => {});
    }
  }, [selectedConversationId, selectedConversation, setConversations]);

  // Reset markedReadRef when conversation changes so it fires again for new conv
  useEffect(() => {
    markedReadRef.current = null;
  }, [selectedConversationId]);

  function handleSelectConversation(conversation: ConversationSummary) {
    const unreadToDeduct = conversation.unreadCount;

    setSelectedConversationId(conversation.conversationId);

    setConversations((prev) =>
      prev.map((c) =>
        c.conversationId === conversation.conversationId
          ? { ...c, unreadCount: 0 }
          : c,
      ),
    );

    conversationService
      .markConversationAsRead(conversation.conversationId)
      .catch(() => {});

    if (unreadToDeduct > 0) {
      window.dispatchEvent(
        new CustomEvent("messages:read", { detail: { deduct: unreadToDeduct } }),
      );
    }
  }

  function handleConversationCreated(newConversationId: string) {
    refetch();
    redirectedForRef.current = null;
    setConversations((prev) =>
      prev.map((c) =>
        c.conversationId === newConversationId
          ? { ...c, unreadCount: 0 }
          : c,
      ),
    );
  }

  return (
    <main className="flex h-screen w-full justify-center gap-4 bg-zinc-950 px-4 py-4">
      <ConversationListPanel
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onConversationCreated={handleConversationCreated}
        conversations={conversations}
        isLoading={isLoading}
        error={error}
      />

      {selectedConversationId ? (
        <ChatWindow conversationId={selectedConversationId} />
      ) : (
        <div className="flex flex-1 max-w-3xl flex-col items-center justify-center rounded-md border border-zinc-800 bg-zinc-950 text-center">
          <p className="text-sm text-zinc-400">
            Select a conversation to start messaging
          </p>
        </div>
      )}
    </main>
  );
}
