import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useConversationSummary } from "../hooks/useConversationSummary";
import ConversationListPanel from "../components/ConversationListPanel";
import ChatWindow from "../components/ChatWindow";
import type { ConversationSummary } from "../types";
import { conversationService } from "../conversationService";
import type { RootState } from "../../../app/store";

export default function MessagesPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const currentUserId = useSelector(
    (state: RootState) => state.user.currentUser?.id ?? null,
  );

  const {
    conversations,
    setConversations,
    isLoading,
    error,
    refetch,
  } = useConversationSummary(currentUserId, conversationId ?? null);

  const selectedConversation =
    conversations.find((c) => c.conversationId === conversationId) ?? null;

  const redirectedForRef = useRef<string | null>(null);
  const markedReadRef = useRef<string | null>(null);

  // When MessagesPage unmounts (user navigates away), tell navbar to re-sync
  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent("messages:refetch"));
    };
  }, []);

  useEffect(() => {
    if (
      conversationId &&
      !isLoading &&
      conversations.length > 0 &&
      !selectedConversation &&
      redirectedForRef.current !== conversationId
    ) {
      redirectedForRef.current = conversationId;
      navigate("/messages", { replace: true });
    }
  }, [conversationId, isLoading, conversations.length, selectedConversation, navigate]);

  // Mark as read on initial load or refresh — fires when conversation loads
  useEffect(() => {
    if (!conversationId || !selectedConversation) return;
    if (markedReadRef.current === conversationId) return;

    markedReadRef.current = conversationId;

    const unreadToDeduct = selectedConversation.unreadCount;

    if (unreadToDeduct > 0) {
      // Update local state
      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c,
        ),
      );

      // Tell navbar to deduct
      window.dispatchEvent(
        new CustomEvent("messages:read", { detail: { deduct: unreadToDeduct } }),
      );

      // Mark on server
      conversationService.markConversationAsRead(conversationId).catch(() => {});
    }
  }, [conversationId, selectedConversation, setConversations]);

  // Reset markedReadRef when conversation changes so it fires again for new conv
  useEffect(() => {
    markedReadRef.current = null;
  }, [conversationId]);

  function handleSelectConversation(conversation: ConversationSummary) {
    const unreadToDeduct = conversation.unreadCount;

    setConversations((prev) =>
      prev.map((c) =>
        c.conversationId === conversation.conversationId
          ? { ...c, unreadCount: 0 }
          : c,
      ),
    );

    navigate(`/messages/${conversation.conversationId}`);

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
        selectedConversationId={conversationId ?? null}
        onSelectConversation={handleSelectConversation}
        onConversationCreated={handleConversationCreated}
        conversations={conversations}
        isLoading={isLoading}
        error={error}
      />

      {conversationId ? (
        <ChatWindow />
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
