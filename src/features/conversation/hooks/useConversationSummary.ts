import { useEffect, useState, useCallback, useRef } from "react";
import { conversationService } from "../conversationService";
import { useSocket } from "./useSocket";
import type { ConversationSummary, Message } from "../types";

type UseConversationSummaryResult = {
  conversations: ConversationSummary[];
  setConversations: React.Dispatch<React.SetStateAction<ConversationSummary[]>>;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useConversationSummary(
  currentUserId: string | null,
  activeConversationId?: string | null,
): UseConversationSummaryResult {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeConvIdRef = useRef(activeConversationId);
  const currentUserIdRef = useRef(currentUserId);

  // Single shared timer — all burst messages collapse into one re-fetch.
  const refetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { activeConvIdRef.current = activeConversationId; }, [activeConversationId]);
  useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);

  const fetchConversations = useCallback(async () => {
    const uid = currentUserIdRef.current;
    if (!uid) {
      setConversations([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const fetched = await conversationService.getConversationsSummary(uid);
      setConversations(fetched);
      setError(null);
    } catch (err) {
      console.error("[useConversationSummary] fetch failed:", err);
      setError("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    fetchConversations();
  }, [currentUserId, fetchConversations]);

  // Silent re-fetch — only updates unread counts, no loading flash.
  const refetchUnreadCounts = useCallback(() => {
    const uid = currentUserIdRef.current;
    if (!uid) return;
    conversationService
      .getConversationsSummary(uid)
      .then((fetched) => {
        setConversations((prev) =>
          prev.map((c) => {
            const fresh = fetched.find((f) => f.conversationId === c.conversationId);
            return fresh ? { ...c, unreadCount: fresh.unreadCount } : c;
          }),
        );
      })
      .catch(() => {});
  }, []);

  const handleMessageReceived = useCallback(
    (message: Message) => {
      const isActive = activeConvIdRef.current === message.conversationId;
      const isFromMe = message.senderId === currentUserIdRef.current;
      const preview = message.content ?? (message.attachment ? "[Attachment]" : null);

      // Optimistic +1 per message so bursts update the badge instantly and
      // correctly (2 messages -> badge 2, not badge 1 then overwritten).
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.conversationId === message.conversationId);
        if (idx === -1) return prev;

        const existing = prev[idx];
        const updated: ConversationSummary = {
          ...existing,
          lastMessagePreview: preview,
          lastMessageAt: message.createdAt,
          unreadCount: isFromMe || isActive ? 0 : existing.unreadCount + 1,
        };

        return [updated, ...prev.filter((_, i) => i !== idx)];
      });

      // Corrective re-fetch, debounced at 3 000 ms.
      // Fires once after the burst settles — by then the server has processed
      // all messages and returns the true count, fixing any edge-case drift.
      // 3 s is long enough to avoid stomping the optimistic counts mid-burst.
      if (!isFromMe && !isActive) {
        if (refetchTimeoutRef.current) clearTimeout(refetchTimeoutRef.current);
        refetchTimeoutRef.current = setTimeout(refetchUnreadCounts, 3_000);
      }
    },
    [refetchUnreadCounts],
  );

  useEffect(() => {
    return () => {
      if (refetchTimeoutRef.current) clearTimeout(refetchTimeoutRef.current);
    };
  }, []);

  useSocket({ conversationId: null, onMessageReceived: handleMessageReceived });

  return {
    conversations,
    setConversations,
    isLoading,
    error,
    refetch: fetchConversations,
  };
}
