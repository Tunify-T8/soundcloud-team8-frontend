import { useState, useEffect, useCallback, useRef } from "react";
import type { Message } from "../types";
import { conversationService } from "../conversationService";

export function useConversationMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasEarlierMessages, setHasEarlierMessages] = useState(false);

  const fetchedForRef = useRef<string | null>(null);

  const fetchPage = useCallback(
    async (page: number, convId: string): Promise<void> => {
      const response = await conversationService.getMessages(convId, page, 20);

      if (fetchedForRef.current !== convId) return;

      const pages = response.totalPages ?? 1;
      setTotalPages(pages);
      setCurrentPage(page);
      setHasEarlierMessages(page > 1);

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const incoming = Array.isArray(response.messages) ? response.messages : [];
        if (page === pages || pages === 1) {
          // Last or only page — replace entirely with newest messages
          return incoming;
        }
        // Loading an earlier page — prepend, deduplicate
        const newOnes = incoming.filter((m) => !existingIds.has(m.id));
        return [...newOnes, ...prev];
      });
    },
    [],
  );

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setError(null);
      setCurrentPage(1);
      setTotalPages(1);
      setHasEarlierMessages(false);
      fetchedForRef.current = null;
      return;
    }

    fetchedForRef.current = conversationId;
    setIsLoading(true);
    setMessages([]);

    const load = async () => {
      try {
        // Step 1 — fetch page 1 to discover totalPages
        const firstResponse = await conversationService.getMessages(
          conversationId,
          1,
          100,
        );

        if (fetchedForRef.current !== conversationId) return;

        const pages = firstResponse.totalPages ?? 1;
        setTotalPages(pages);

        if (pages <= 1) {
          // Only one page — use this response directly
          setMessages(
            Array.isArray(firstResponse.messages) ? firstResponse.messages : [],
          );
          setCurrentPage(1);
          setHasEarlierMessages(false);
        } else {
          // Step 2 — fetch last page for newest messages
          const lastResponse = await conversationService.getMessages(
            conversationId,
            pages,
            20,
          );

          if (fetchedForRef.current !== conversationId) return;

          setMessages(
            Array.isArray(lastResponse.messages) ? lastResponse.messages : [],
          );
          setCurrentPage(pages);
          setHasEarlierMessages(true);
        }
      } catch (err) {
        console.error("[useConversationMessages] fetch failed:", err);
        if (fetchedForRef.current === conversationId) {
          setError("Failed to load messages. Please try again.");
        }
      } finally {
        if (fetchedForRef.current === conversationId) {
          setIsLoading(false);
        }
      }
    };

    load();
  }, [conversationId]);

  const loadEarlier = useCallback(async () => {
    if (!conversationId || currentPage <= 1) return;
    setIsLoading(true);
    try {
      await fetchPage(currentPage - 1, conversationId);
    } catch (err) {
      console.error("[useConversationMessages] loadEarlier failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, currentPage, fetchPage]);

  const appendMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  const replaceMessage = useCallback((tempId: string, realId: string) => {
    if (!tempId || !realId || tempId === realId) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === tempId ? { ...m, id: realId } : m)),
    );
  }, []);

  const confirmLatestMessage = useCallback((realId: string) => {
    setMessages((prev) => {
      const lastTempIndex = [...prev]
        .reverse()
        .findIndex((m) => m.id.startsWith("temp-"));
      if (lastTempIndex === -1) return prev;
      const actualIndex = prev.length - 1 - lastTempIndex;
      return prev.map((m, i) =>
        i === actualIndex ? { ...m, id: realId } : m,
      );
    });
  }, []);

  const markLocalRead = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, read: true } : m)),
    );
  }, []);

  return {
    messages,
    isLoading,
    error,
    currentPage,
    totalPages,
    hasNextPage: hasEarlierMessages,
    loadEarlier,
    refetch: () => {
      if (!conversationId) return;
      fetchedForRef.current = conversationId;
      setIsLoading(true);
      conversationService
        .getMessages(conversationId, 1, 20)
        .then((r) => {
          if (fetchedForRef.current !== conversationId) return;
          const pages = r.totalPages ?? 1;
          setTotalPages(pages);
          if (pages <= 1) {
            setMessages(Array.isArray(r.messages) ? r.messages : []);
            setCurrentPage(1);
            setHasEarlierMessages(false);
            return;
          }
          return conversationService
            .getMessages(conversationId, pages, 20)
            .then((last) => {
              if (fetchedForRef.current !== conversationId) return;
              setMessages(Array.isArray(last.messages) ? last.messages : []);
              setCurrentPage(pages);
              setHasEarlierMessages(true);
            });
        })
        .catch(() => setError("Failed to reload messages."))
        .finally(() => {
          if (fetchedForRef.current === conversationId) setIsLoading(false);
        });
    },
    appendMessage,
    replaceMessage,
    confirmLatestMessage,
    markLocalRead,
  };
}