import { useState, useEffect, useRef } from "react";
import type { User } from "../types";
import { api } from "@/features/auth/services/api";

interface FollowingUser {
  id: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string | null;
}

function normaliseUser(raw: FollowingUser): User {
  return {
    id: raw.id,
    displayName: raw.displayName || raw.username || `User ${raw.id.slice(0, 6)}`,
    avatarUrl: raw.avatarUrl ?? null,
  };
}


export function useFollowingSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const allFollowingsRef = useRef<User[]>([]);
  const fetchedRef = useRef(false);

  // Fetch following list once
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    setIsLoading(true);
    api
      .get("/users/me/following", { params: { limit: 200 } })
      .then(({ data }) => {
        // Handle both array and paginated responses
        const raw: FollowingUser[] = Array.isArray(data)
          ? data
          : (data?.data ?? data?.items ?? data?.following ?? []);

        allFollowingsRef.current = raw.map(normaliseUser);
      })
      .catch((err) => {
        console.warn("[useFollowingSuggestions] fetch failed:", err?.message);
        allFollowingsRef.current = [];
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Filter client-side whenever query changes
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();

    if (!trimmed || trimmed.length < 1) {
      setSuggestions([]);
      return;
    }

    const matched = allFollowingsRef.current.filter((u) =>
      u.displayName.toLowerCase().includes(trimmed),
    );

    setSuggestions(matched.slice(0, 8));
  }, [query]);

  return { suggestions, isLoading };
}
