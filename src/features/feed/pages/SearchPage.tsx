import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { feedService } from "../feedservice";
import SearchResultItem from "../components/SearchResultItem";
import type {
  SearchResult,
  TrackSearchResult,
  UserSearchResult,
  CollectionSearchResult,
  FilterType,
} from "../type";

// ─── Filter sidebar ───────────────────────────────────────────────────────────

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "everything", label: "Everything" },
  { key: "tracks", label: "Tracks" },
  { key: "people", label: "People" },
  { key: "albums", label: "Albums" },
  { key: "playlists", label: "Playlists" },
];

function FilterSidebar({
  active,
  onChange,
}: {
  active: FilterType;
  onChange: (f: FilterType) => void;
}) {
  return (
    <div className="w-[200px] shrink-0 pt-10 pl-6 pr-4 flex flex-col justify-between min-h-[calc(100vh-48px)]">
      <div>
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            data-testid={`filter-${key}`}
            onClick={() => onChange(key)}
            className={`w-full text-left px-4 py-2 mb-1 rounded text-[14px] font-semibold transition-colors ${
              active === key
                ? "bg-white text-black"
                : "text-gray-300 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Legal footer matches SoundCloud sidebar */}
      <div className="text-zinc-500 text-[12px] pb-8 leading-6">
        <a href="#" className="hover:text-zinc-300">
          Legal
        </a>{" "}
        ·{" "}
        <a href="#" className="hover:text-zinc-300">
          Privacy
        </a>{" "}
        ·{" "}
        <a href="#" className="hover:text-zinc-300">
          Cookie Policy
        </a>{" "}
        ·{" "}
        <a href="#" className="hover:text-zinc-300">
          Imprint
        </a>{" "}
        ·{" "}
        <a href="#" className="hover:text-zinc-300">
          Artist Resources
        </a>{" "}
        ·{" "}
        <a href="#" className="hover:text-zinc-300">
          Newsroom
        </a>{" "}
        ·{" "}
        <a href="#" className="hover:text-zinc-300">
          Charts
        </a>{" "}
        ·{" "}
        <a href="#" className="hover:text-zinc-300">
          Transparency Reports
        </a>
        <div className="mt-3">
          <span className="font-semibold text-white">Language:</span>{" "}
          <a href="#" className="text-blue-400 hover:text-blue-300">
            English (US)
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [activeFilter, setActiveFilter] = useState<FilterType>("everything");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Re-fetch when query or filter changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const fetchFn =
      activeFilter === "tracks"
        ? () => feedService.searchTracks(query)
        : activeFilter === "people"
          ? () => feedService.searchPeople(query)
          : activeFilter === "albums"
            ? () => feedService.searchCollections(query)
            : activeFilter === "playlists"
              ? () => feedService.searchCollections(query)
              : () => feedService.search(query);
    fetchFn()
      .then(setResults)
      .finally(() => setLoading(false));
  }, [query, activeFilter]);

  // Summary line counts
  const tracks = results.filter(
    (r): r is TrackSearchResult => r.type === "track",
  );
  const users = results.filter((r): r is UserSearchResult => r.type === "user");
  const collections = results.filter(
    (r): r is CollectionSearchResult =>
      r.type === "album" || r.type === "playlist",
  );

  const summaryParts = [
    collections.length > 0 &&
      `${collections.length} playlist${collections.length !== 1 ? "s" : ""}`,
    tracks.length > 0 &&
      `${tracks.length} track${tracks.length !== 1 ? "s" : ""}`,
    users.length > 0 &&
      `${users.length} ${users.length !== 1 ? "people" : "person"}`,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-[#181818] flex">
      <FilterSidebar active={activeFilter} onChange={setActiveFilter} />

      <div className="flex-1 pt-10 px-8 max-w-[860px]">
        {/* Heading */}
        {query && (
          <h1 className="text-white text-[22px] font-bold mb-2">
            Search results for <span className="font-bold">"{query}"</span>
          </h1>
        )}

        {/* Summary line */}
        {!loading && summaryParts.length > 0 && (
          <p className="text-gray-400 text-[14px] mb-8">
            Found {summaryParts.join(", ")}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <p
            data-testid="search-page-loading"
            className="text-gray-400 text-sm mt-8"
          >
            Searching...
          </p>
        )}

        {/* Empty */}
        {!loading && results.length === 0 && query && (
          <p
            data-testid="search-page-no-results"
            className="text-gray-500 text-sm mt-8"
          >
            No results for "{query}"
          </p>
        )}

        {/* 
          Single clean loop — SearchResultItem dispatches to the right card.
          No messy conditionals here. Feed page is completely unaffected.
        */}
        <div data-testid="search-page-results">
          {!loading &&
            results.map((result) => (
              <SearchResultItem key={result.id} result={result} />
            ))}
        </div>
      </div>
    </div>
  );
}
