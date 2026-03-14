import { useEffect, useState } from "react";
import { conversationService } from "../conversationService";
import type { ConversationSummary } from "../types";

type UseConversationSummaryResult = {
  conversations: ConversationSummary[];
  isLoading: boolean;
  error: string | null;
};

export function useConversationSummary(): UseConversationSummaryResult {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchConversations() {
      try {
        const fetchedConversations = await conversationService.getConversations();
        if (!isMounted) {
          return;
        }
        setConversations(fetchedConversations);
        setError(null);
      } catch {
        if (!isMounted) {
          return;
        }
        setError("Failed to load conversations.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchConversations();

    return () => {
      isMounted = false;
    };
  }, []);

  return { conversations, isLoading, error };
}
