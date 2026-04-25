import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { playlistService } from "../../libraryService";
import MediaCard from "../../components/MediaCard";
import type { CollectionPreview, CollectionPrivacy } from "../../types";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";


const COLS = 6;

type FilterOption = "All" | "Created" | "Liked";

type PlaylistGridItem = {
  id: string;
  title: string;
  subtitle: string;
  coverUrl: string | null;
  privacy: CollectionPrivacy;
  isLiked: boolean;
};

function PlaylistCard({ item }: { item: PlaylistGridItem }) {
  return (
    <Link to={`/collections/${item.id}`} className="block cursor-pointer group">
      <div className="w-full aspect-square rounded-sm overflow-hidden mb-2 relative bg-[#282828]">
        {item.coverUrl && (
          <img
            src={item.coverUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="black">
              <polygon points="2,0 16,7 2,14" />
            </svg>
          </div>
        </div>
      </div>
      <p className="flex items-center gap-1 text-white text-xs font-bold truncate">
        {item.isLiked && (
          <Heart size={10} fill="currentColor" className="shrink-0 text-gray-400" />
        )}
        <span className="truncate">{item.title}</span>
      </p>
      <p className="text-zinc-400 text-xs truncate">{item.subtitle}</p>
    </Link>
  );
}
// function PlaylistCard({ item }: { item: PlaylistGridItem }) {
//   const navigate = useNavigate();
//   return (
//     <div
//       data-testid={`playlist-card-${item.id}`}
//       className="cursor-pointer group"
//       onClick={() => navigate(`/me/sets/${item.id}`)}
//     >
//       <div className="w-full aspect-square rounded-sm overflow-hidden mb-2 relative bg-[#282828] group-hover:bg-[#1a1a1a] transition-colors duration-300">
//         {item.coverUrl && (
//           <img
//             src={item.coverUrl}
//             alt={item.title}
//             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//           />
//         )}
//         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm" />
//         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//           <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl">
//             <svg width="18" height="18" viewBox="0 0 14 14" fill="black">
//               <polygon points="3,1 13,7 3,13" />
//             </svg>
//           </div>
//         </div>
//       </div>
//       <p data-testid={`playlist-title-${item.id}`} className="text-white text-xs font-bold truncate">{item.title}</p>
//       <p data-testid={`playlist-subtitle-${item.id}`} className="text-zinc-400 text-xs truncate">{item.subtitle}</p>
//     </div>
//   );
// }

export default function PlaylistsTab() {
    const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filterOption, setFilterOption] = useState<FilterOption>("All");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [playlists, setPlaylists] = useState<CollectionPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      const res = await playlistService.getMyCollections(1, 50, "PLAYLIST");
      if (!mounted) return;
      if (!res?.data) { setError("Failed to load playlists."); setLoading(false); return; }
      setPlaylists(res.data);
      setLoading(false);
    };
    void fetch();
    return () => { mounted = false; };
  }, []);

  const filteredItems = useMemo<PlaylistGridItem[]>(() => {
    const q = query.trim().toLowerCase();
    return playlists
      .filter((p) => {
        if (filterOption === "Created" && p.privacy !== "public") return false;
        if (filterOption === "Liked" && p.privacy !== "private") return false;
      })
      .map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: `${p.trackCount} track${p.trackCount === 1 ? "" : "s"}`,
        coverUrl: p.coverUrl,
        privacy: p.privacy,
        isLiked: p.isLiked,
      }));
  }, [playlists, query, filterOption]);

  const totalSlots = Math.ceil(Math.max(filteredItems.length, 1) / COLS) * COLS;
  const totalSlots = Math.ceil(Math.max(filteredItems.length, 1) / COLS) * COLS;

  return (
    <div data-testid="playlists-tab">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-sm">Hear your own playlists and the playlists you've liked:</h2>
        <div className="flex items-center gap-2">
          <input
            data-testid="playlists-filter-input"
            placeholder="Filter"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-[#282828] border border-zinc-700 rounded-sm px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 w-52"
          />
          <div className="relative">
            <button
              data-testid="playlists-filter-dropdown-btn"
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 bg-[#282828] border border-zinc-700 rounded-sm px-3 py-1.5 text-xs text-white hover:border-zinc-500 transition-colors min-w-[80px]"
            >
              {filterOption}
              <ChevronDown size={12} />
            </button>
            {dropdownOpen && (
              <div
                data-testid="playlists-filter-dropdown"
                className="absolute right-0 top-full mt-1 w-32 bg-[#1a1a1a] border border-zinc-800 rounded shadow-xl z-50 py-1"
              >
                {(["All", "Created", "Liked"] as FilterOption[]).map((opt) => (
                  <button
                    key={opt}
                    data-testid={`playlists-filter-opt-${opt.toLowerCase()}`}
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
        <h2 className="text-white font-bold text-sm">
          Hear your own playlists and the playlists you've liked:
        </h2>
        <input
          placeholder="Filter"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-[#282828] border border-zinc-700 rounded-sm px-3 py-1 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 w-64"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-6 gap-4" data-testid="playlists-loading">
          {Array.from({ length: COLS }).map((_, i) => (
            <div key={i} className="w-full aspect-square rounded-sm bg-[#282828] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <p data-testid="playlists-error" className="text-red-400 text-sm text-center py-20">{error}</p>
      ) : filteredItems.length === 0 ? (
        <p data-testid="playlists-empty" className="text-white font-bold text-2xl text-center py-20">
          You have no playlists yet
        </p>
      ) : (
        <div className="grid grid-cols-6 gap-4" data-testid="playlists-grid">
          {Array.from({ length: totalSlots }).map((_, i) => {
            const item = filteredItems[i];
            return item ? (
              <MediaCard
                key={item.id}
                id={item.id}
                title={item.title}
                subtitle={item.subtitle}
                coverUrl={item.coverUrl}
                onClick={() => navigate(`/me/sets/${item.id}`)}
              />
            ) : (
              <div key={i} data-testid={`playlist-slot-${i}`} className="w-full aspect-square rounded-sm bg-[#282828]" />
            );
          })}
        </div>
      )}
        <p className="text-white font-bold text-lg text-center py-20">
          You have not liked any playlists yet
        </p>
      ) : (
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: totalSlots }).map((_, i) => {
            const item = filteredItems[i];
            return item ? (
              <PlaylistCard key={item.id} item={item} />
            ) : (
              <div
                key={i}
                className="w-full aspect-square rounded-sm bg-[#282828]"
              />
            );
          })}
        </div>
      )}
    </div>
  );
}