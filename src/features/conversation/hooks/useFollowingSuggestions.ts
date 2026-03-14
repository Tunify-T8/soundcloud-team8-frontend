import { useState, useEffect } from "react";
import type { FollowingUser } from "../types";
import { conversationService } from "../conversationService";

export function useFollowingSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<FollowingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const all = await conversationService.getFollowings();
        setSuggestions(
          all.filter((u) =>
            u.username.toLowerCase().includes(trimmed.toLowerCase()),
          ),
        );
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return { suggestions, isLoading };
}
