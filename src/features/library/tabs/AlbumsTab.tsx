import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { playlistService } from "../libraryService";
import { useMe } from "@/features/profile/context/useMe";
import type { CollectionPreview, CollectionPrivacy } from "../types";

const COLS = 6;
type FilterOption = "All" | "Created" | "Liked";

type AlbumGridItem = {
  id: string;
  title: string;
  subtitle: string;
  coverUrl: string | null;
  privacy: CollectionPrivacy;
  isLiked: boolean;
};

function AlbumCard({
  item,
  forceLiked = false,
}: {
  item: AlbumGridItem;
  forceLiked?: boolean;
}) {
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
        {(item.isLiked || forceLiked) && (
          <Heart
            size={10}
            fill="currentColor"
            className="shrink-0 text-gray-400"
          />
        )}
        <span className="truncate">{item.title}</span>
      </p>
      <p className="text-zinc-400 text-xs truncate">{item.subtitle}</p>
    </Link>
  );
}

export default function AlbumsTab() {
  const { me } = useMe();
  const [query, setQuery] = useState("");
  const [filterOption, setFilterOption] = useState<FilterOption>("All");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [albums, setAlbums] = useState<CollectionPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchAlbums = async () => {
      setLoading(true);
      setError(null);

      const username = me?.username?.trim();
      const res = username
        ? await playlistService.getUserAlbums(username, 1, 50)
        : await playlistService.getMyCollections(1, 50, "ALBUM");

      if (!mounted) return;
      if (!res?.data) {
        setError("Failed to load albums.");
        setLoading(false);
        return;
      }

      setAlbums(res.data);
      setLoading(false);
    };

    void fetchAlbums();

    return () => {
      mounted = false;
    };
  }, [me?.username]);

  const filteredItems = useMemo<AlbumGridItem[]>(() => {
    const q = query.trim().toLowerCase();
    return albums
      .filter((a) => {
        if (filterOption === "Created" && a.isLiked) return false;
        if (filterOption === "Liked" && !a.isLiked) return false;
        if (q && !a.title.toLowerCase().includes(q)) return false;
        return true;
      })
      .map((a) => {
        // Some user album endpoints return a different count key than trackCount.
        const album = a as CollectionPreview & {
          tracksCount?: number;
          totalTracks?: number;
        };
        const trackCount =
          album.trackCount ?? album.tracksCount ?? album.totalTracks ?? 0;

        return {
          id: a.id,
          title: a.title,
          subtitle: `${trackCount} track${trackCount === 1 ? "" : "s"}`,
          coverUrl: a.coverUrl,
          privacy: a.privacy,
          isLiked: a.isLiked,
        };
      });
  }, [albums, query, filterOption]);

  const totalSlots = Math.ceil(Math.max(filteredItems.length, 1) / COLS) * COLS;

  return (
    <div data-testid="albums-tab">
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-white font-bold text-sm">Hear your own albums and the albums you've liked:</h2>
        <div className="flex items-center gap-2">
          <input
            data-testid="albums-filter-input"
            placeholder="Filter"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-[#282828] border border-zinc-700 rounded-sm px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 w-full sm:w-52"
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

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" data-testid="albums-loading">
          {Array.from({ length: COLS }).map((_, i) => (
            <div
              key={i}
              className="w-full aspect-square rounded-sm bg-[#282828] animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <p
          data-testid="albums-error"
          className="text-red-400 text-sm text-center py-20"
        >
          {error}
        </p>
      ) : filteredItems.length === 0 ? (
        <p data-testid="albums-empty" className="text-white font-bold text-2xl text-center py-20">
          {filterOption === "Liked"
            ? "You haven't liked any albums yet"
            : "You have no albums yet"}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" data-testid="albums-grid">
          {Array.from({ length: totalSlots }).map((_, i) => {
            const item = filteredItems[i];
            return item ? (
              <AlbumCard
                key={item.id}
                item={item}
                forceLiked={filterOption === "Liked"}
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
