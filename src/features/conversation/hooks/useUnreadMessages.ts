import { useState, useEffect, useRef, useCallback } from "react";
import { socketSingleton } from "./useSocket";
import { conversationService } from "../conversationService";
import type { Message } from "../types";

export function useUnreadMessages(currentUserId: string | null) {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const currentUserIdRef = useRef(currentUserId);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  const fetchTotal = useCallback(async () => {
    const uid = currentUserIdRef.current;
    if (!uid) return;
    try {
      const conversations = await conversationService.getConversationsSummary(uid);

      // Get the active conversationId from the URL at fetch time
      const pathMatch = window.location.pathname.match(/^\/messages\/([^/]+)/);
      const activeConvId = pathMatch?.[1] ?? null;

      const total = conversations.reduce((sum, c) => {
        // Don't count unread for the conversation the user is currently viewing
        if (activeConvId && c.conversationId === activeConvId) return sum;
        return sum + (c.unreadCount ?? 0);
      }, 0);

      setUnreadMessages(total);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      setUnreadMessages(0);
      return;
    }
    fetchTotal();
    const interval = setInterval(fetchTotal, 60_000);
    return () => clearInterval(interval);
  }, [currentUserId, fetchTotal]);

  // On socket message: debounced re-fetch instead of +1
  useEffect(() => {
    const unsub = socketSingleton.subscribe((event) => {
      if (event.type !== "message:received") return;
      const msg: Message = event.message;
      if (msg.senderId === currentUserIdRef.current) return;
      const isViewing =
        window.location.pathname === `/messages/${msg.conversationId}`;
      if (isViewing) return;

      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = setTimeout(fetchTotal, 300);
    });
    return () => {
      unsub();
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, [fetchTotal]);

  // Decrement when MessagesPage marks a conversation as read
  useEffect(() => {
    const handler = (e: Event) => {
      const { deduct } = (e as CustomEvent<{ deduct: number }>).detail;
      setUnreadMessages((prev) => Math.max(0, prev - deduct));
    };
    window.addEventListener("messages:read", handler);
    return () => window.removeEventListener("messages:read", handler);
  }, []);

  // Re-fetch when MessagesPage unmounts (user navigates away from messages)
  useEffect(() => {
    const handler = () => fetchTotal();
    window.addEventListener("messages:refetch", handler);
    return () => window.removeEventListener("messages:refetch", handler);
  }, [fetchTotal]);

  // Re-fetch on route changes (browser back/forward) so badge updates immediately
  useEffect(() => {
    const handleRouteChange = () => fetchTotal();
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, [fetchTotal]);

  return { unreadMessages };
}
