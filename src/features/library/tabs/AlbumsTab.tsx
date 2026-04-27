//working with mock data so far!!!
//**********************************************//
import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import type { CollectionItem } from "../types";
import { ALBUMS } from "../tests/mockdata";
import MediaCard from "../components/MediaCard";


const COLS = 6;
const albums = ALBUMS;
type FilterOption = "All" | "Created" | "Liked";

function AlbumCard({ item }: { item: CollectionItem }) {
  return (
    <div data-testid={`album-card-${item.id}`} className="cursor-pointer group relative">
      <div className="w-full aspect-square rounded-sm overflow-hidden mb-2 relative bg-[#282828] group-hover:bg-[#1a1a1a] transition-colors duration-300">
        {item.coverUrl && (
          <img
            src={item.coverUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl">
            <svg width="18" height="18" viewBox="0 0 14 14" fill="black">
              <polygon points="3,1 13,7 3,13" />
            </svg>
          </div>
        </div>
      </div>
      <p data-testid={`album-title-${item.id}`} className="text-white text-xs font-bold truncate">{item.title}</p>
      <p data-testid={`album-subtitle-${item.id}`} className="text-zinc-400 text-xs truncate">{item.subtitle}</p>
    </div>
  );
}

export default function AlbumsTab() {
  const [query, setQuery] = useState("");
  const [filterOption, setFilterOption] = useState<FilterOption>("All");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [source] = useState(() => [...albums]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return source.filter((item) => {
      if (filterOption === "Created") return false;
      if (filterOption === "Liked") return false;
      return q ? item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q) : true;
    });
  }, [source, query, filterOption]);

  const totalSlots = Math.ceil(Math.max(filteredItems.length, 1) / COLS) * COLS;

  return (
    <div data-testid="albums-tab">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-sm">Hear your own albums and the albums you've liked:</h2>
        <div className="flex items-center gap-2">
          <input
            data-testid="albums-filter-input"
            placeholder="Filter"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-[#282828] border border-zinc-700 rounded-sm px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 w-52"
          />
          <div className="relative">
            <button
              data-testid="albums-filter-dropdown-btn"
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 bg-[#282828] border border-zinc-700 rounded-sm px-3 py-1.5 text-xs text-white hover:border-zinc-500 transition-colors min-w-[80px]"
            >
              {filterOption}
              <ChevronDown size={12} />
            </button>
            {dropdownOpen && (
              <div
                data-testid="albums-filter-dropdown"
                className="absolute right-0 top-full mt-1 w-32 bg-[#1a1a1a] border border-zinc-800 rounded shadow-xl z-50 py-1"
              >
                {(["All", "Created", "Liked"] as FilterOption[]).map((opt) => (
                  <button
                    key={opt}
                    data-testid={`albums-filter-opt-${opt.toLowerCase()}`}
                    onClick={() => { setFilterOption(opt); setDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors ${filterOption === opt ? "text-white font-bold" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {source.length === 0 ? (
        <p data-testid="albums-empty" className="text-white font-bold text-2xl text-center py-20">
          You haven't liked any albums yet
        </p>
      ) : filteredItems.length === 0 ? (
        <p data-testid="albums-no-results" className="text-white font-bold text-lg text-center py-20">
          No albums match your filter
        </p>
      ) : (
        <div className="grid grid-cols-6 gap-4" data-testid="albums-grid">
          {Array.from({ length: totalSlots }).map((_, i) => {
            const item = filteredItems[i];
            return item ? (
                <MediaCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  subtitle={item.subtitle ?? ""}
                  coverUrl={item.coverUrl}
                />
            ) : (
              <div key={i} data-testid={`album-slot-${i}`} className="w-full aspect-square rounded-sm bg-[#282828]" />
            );
          })}
        </div>
      )}
    </div>
  );
}