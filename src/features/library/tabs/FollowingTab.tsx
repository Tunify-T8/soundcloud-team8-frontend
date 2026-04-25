import { useState, useMemo } from "react";
import FollowingSection from "../components/FollowingSection";
import { FOLLOWING } from "../tests/mockdata";
import type { FollowingUser } from "../types";

export default function FollowingTab() {
  const [query, setQuery] = useState("");
  const [source] = useState<FollowingUser[]>(() => [...FOLLOWING]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter((u) => u.name.toLowerCase().includes(q));
  }, [source, query]);

  return (
    <div data-testid="following-tab">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-sm">Hear what the people you follow have posted:</h2>
        {source.length > 0 && (
          <input
            data-testid="following-filter-input"
            placeholder="Filter"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-[#282828] border border-zinc-700 rounded-sm px-3 py-1 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 w-64"
          />
        )}
      </div>
      {source.length === 0 ? (
        <p data-testid="following-empty" className="text-white font-bold text-2xl text-center py-20">
          You haven't followed anyone yet
        </p>
      ) : filteredUsers.length === 0 ? (
        <p data-testid="following-no-results" className="text-white font-bold text-2xl text-center py-20">
          No results match your filter
        </p>
      ) : (
        <FollowingSection users={filteredUsers} />
      )}
    </div>
  );
}