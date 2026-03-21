import { useState, useEffect } from "react";
import type { User } from "../types";

export function useFollowingSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<User[]>([]);
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
        // TODO: Replace with actual user search endpoint when available
        // For now, this is a placeholder - the backend should provide a /search or /users endpoint
        setSuggestions([]);
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
