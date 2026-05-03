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
    <div
      data-testid="filter-sidebar"
      className="w-full shrink-0 flex flex-row overflow-x-auto gap-1 px-3 py-3 border-b border-zinc-800 md:w-[200px] md:flex-col md:overflow-x-visible md:gap-0 md:justify-between md:pt-10 md:pl-6 md:pr-4 md:min-h-[calc(100vh-48px)] md:border-b-0"
    >
      <div className="flex flex-row gap-1 md:flex-col md:gap-0">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            data-testid={`filter-${key}`}
            onClick={() => onChange(key)}
            className={`whitespace-nowrap text-left px-3 py-2 rounded text-[14px] font-semibold transition-colors md:w-full md:px-4 md:mb-1 ${
              active === key
                ? "bg-white text-black"
                : "text-gray-300 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="hidden md:block text-zinc-500 text-[12px] pb-8 leading-6">
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
      if (results.length !== 0) setResults([]);
      if (loading) setLoading(false);
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
      .then((data) => {
        if (activeFilter === "albums") {
          setResults(
            data.filter(
              (item): item is CollectionSearchResult => item.type === "album",
            ),
          );
          return;
        }
        if (activeFilter === "playlists") {
          setResults(
            data.filter(
              (item): item is CollectionSearchResult =>
                item.type === "playlist",
            ),
          );
          return;
        }
        setResults(data);
      })
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
      `${collections.length} ${
        activeFilter === "albums"
          ? `album${collections.length !== 1 ? "s" : ""}`
          : `playlist${collections.length !== 1 ? "s" : ""}`
      }`,
    tracks.length > 0 &&
      `${tracks.length} track${tracks.length !== 1 ? "s" : ""}`,
    users.length > 0 &&
      `${users.length} ${users.length !== 1 ? "people" : "person"}`,
  ].filter(Boolean) as string[];

  return (
    <div
      data-testid="search-page"
      className="min-h-screen bg-[#0b0b0b] flex flex-col md:flex-row"
    >
      <FilterSidebar active={activeFilter} onChange={setActiveFilter} />

      <div
        data-testid="search-page-content"
        className="flex-1 pt-4 px-4 sm:px-6 sm:pt-6 md:pt-10 md:px-8 max-w-[860px]"
      >
        {query && (
          <h1
            data-testid="search-heading"
            className="text-white text-[22px] font-bold mb-2"
          >
            Search results for <span className="font-bold">"{query}"</span>
          </h1>
        )}

        {!loading && summaryParts.length > 0 && (
          <p
            data-testid="search-summary"
            className="text-gray-400 text-[14px] mb-8"
          >
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
