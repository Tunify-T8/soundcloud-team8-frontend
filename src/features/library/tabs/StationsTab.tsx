import { useState, useMemo } from "react";
import type { CollectionItem } from "../types";

const COLS = 6;
const stations: CollectionItem[] = [];

function StationCard({ item }: { item: CollectionItem }) {
  return (
    <div data-testid={`station-card-${item.id}`} className="cursor-pointer group relative">
      <div className="w-full aspect-square rounded-full overflow-hidden mb-2 relative bg-[#282828] group-hover:bg-[#1a1a1a] transition-colors duration-300">
        {item.coverUrl && (
          <img
            src={item.coverUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl">
            <svg width="18" height="18" viewBox="0 0 14 14" fill="black">
              <polygon points="3,1 13,7 3,13" />
            </svg>
          </div>
        </div>
      </div>
      <p data-testid={`station-title-${item.id}`} className="text-white text-xs font-bold truncate text-center">{item.title}</p>
      <p data-testid={`station-subtitle-${item.id}`} className="text-zinc-400 text-xs truncate text-center">{item.subtitle}</p>
    </div>
  );
}

export default function StationsTab() {
  const [query, setQuery] = useState("");
  const [source] = useState(() => [...stations]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle?.toLowerCase().includes(q)
    );
  }, [source, query]);

  const totalSlots = Math.ceil(Math.max(filteredItems.length, 1) / COLS) * COLS;

  return (
    <div data-testid="stations-tab">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-sm">Your liked stations:</h2>
        <input
          data-testid="stations-filter-input"
          placeholder="Filter"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-[#282828] border border-zinc-700 rounded-sm px-3 py-1 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 w-64"
        />
      </div>

      {source.length === 0 ? (
        <p data-testid="stations-empty" className="text-white font-bold text-2x1 text-center py-20">
          You have not liked any stations yet
        </p>
      ) : filteredItems.length === 0 ? (
        <p data-testid="stations-no-results" className="text-white font-bold text-2x1 text-center py-20">
          No stations match your filter
        </p>
      ) : (
        <div className="grid grid-cols-6 gap-4" data-testid="stations-grid">
          {Array.from({ length: totalSlots }).map((_, i) => {
            const item = filteredItems[i];
            return item ? (
              <StationCard key={item.id} item={item} />
            ) : (
              <div key={i} data-testid={`station-slot-${i}`} className="w-full aspect-square rounded-full bg-[#282828]" />
            );
          })}
        </div>
      )}
    </div>
  );
}