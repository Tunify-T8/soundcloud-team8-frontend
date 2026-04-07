import { useState } from "react";
import type { RecentlyPlayedEntry } from "./PlayerTypes";

const STORAGE_KEY = "recentlyPlayed"; // adjust to match your actual key

function loadFromStorage(): RecentlyPlayedEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useRecentlyPlayed(): RecentlyPlayedEntry[] {
  // Lazy initializer — runs once on mount, no effect needed
  const [tracks] = useState<RecentlyPlayedEntry[]>(loadFromStorage);

  return tracks;
}