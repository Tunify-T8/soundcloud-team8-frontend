import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Music, User, Disc, BadgeCheck } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { feedService } from '@/features/feed/feedservice';
import type {
  SearchResult,
  TrackSearchResult,
  UserSearchResult,
  CollectionSearchResult,
} from '../../features/feed/type';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Wait 300ms after the user stops typing before calling the API
  const debouncedQuery = useDebounce(query, 300);

  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Fire search when debounced query changes ──────────────────────────────
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      // Defer state updates to avoid cascading renders
      setTimeout(() => {
        setResults([]);
        setIsLoading(false);
        setIsOpen(false);
      }, 0);
      return;
    }
    setTimeout(() => {
      setIsLoading(true);
    }, 0);
    feedService
      .search(debouncedQuery)
      .then((data) => {
        // Sort by score descending so most relevant results come first
        const sorted = [...data].sort((a, b) => b.score - a.score);
        setResults(sorted);
        setIsOpen(true);
      })
      .finally(() => setIsLoading(false));
  }, [debouncedQuery]);

  // ─── Close dropdown when clicking outside ─────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Keyboard: close on Escape ────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Escape') {
    setIsOpen(false);
  }
  // ← This is the only new line. Dropdown click behavior is untouched.
  if (e.key === 'Enter' && query.trim()) {
    setIsOpen(false);
     setQuery(''); 
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }
};

  // ─── Navigate on result click ─────────────────────────────────────────────
  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    if (result.type === 'user') {
      navigate(`/${result.username}`);
    } else if (result.type === 'track') {
      // TODO: Update to /:artist/:trackTitle once the track page route is added in App.tsx
      navigate(`/${result.artist}`);
    } else {
      // album or playlist — go to artist profile for now
      navigate(`/${result.artist}`);
    }
  };

  // ─── Group results by type ────────────────────────────────────────────────
  const tracks = results.filter((r): r is TrackSearchResult => r.type === 'track');
  const users = results.filter((r): r is UserSearchResult => r.type === 'user');
  const collections = results.filter(
    (r): r is CollectionSearchResult => r.type === 'album' || r.type === 'playlist',
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* ── Input ──────────────────────────────────────────────────────────── */}
      <div className="relative flex items-center">
        <Search size={14} className="absolute left-3 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder="Search"
          className="w-full bg-[#333] text-white text-sm placeholder-gray-400 rounded-full pl-8 pr-4 py-1.5 outline-none focus:bg-[#444] transition-colors"
        />
      </div>

      {/* ── Dropdown ───────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[hsl(0,0%,20%)] rounded-md shadow-2xl z-50 max-h-[480px] overflow-y-auto">

          {/* Loading state */}
          {isLoading && (
            <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>
          )}

          {/* Empty state */}
          {!isLoading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-400">
              No results for "{debouncedQuery}"
            </div>
          )}

          {/* ── Tracks ───────────────────────────────────────────────────── */}
          {tracks.length > 0 && (
            <section>
              <SectionHeader label="Tracks" />
              {tracks.map((track) => (
                <ResultRow key={track.id} onClick={() => handleSelect(track)}>
                  <Thumbnail src={track.coverUrl} fallback={<Music size={14} className="text-gray-500" />} />
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-[13px] font-medium truncate">{track.title}</p>
                    <p className="text-gray-400 text-[11px] truncate">
                      {track.artist}{track.genre ? ` · ${track.genre}` : ''}
                    </p>
                  </div>
                  {track.likesCount > 0 && (
                    <span className="ml-auto text-[10px] text-gray-500 shrink-0">
                      {track.likesCount.toLocaleString()} likes
                    </span>
                  )}
                </ResultRow>
              ))}
            </section>
          )}

          {/* ── People ───────────────────────────────────────────────────── */}
          {users.length > 0 && (
            <section className="border-t border-[hsl(0,0%,13%)]">
              <SectionHeader label="People" />
              {users.map((user) => (
                <ResultRow key={user.id} onClick={() => handleSelect(user)}>
                  <div className="w-9 h-9 rounded-full bg-[hsl(0,0%,22%)] flex items-center justify-center shrink-0">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="text-white text-[13px] font-medium truncate">
                        {user.displayName ?? user.username}
                      </p>
                      {user.isCertified && (
                        <BadgeCheck size={12} className="text-[hsl(14,90%,58%)] shrink-0" />
                      )}
                    </div>
                    <p className="text-gray-400 text-[11px] truncate">
                      @{user.username} · {user.followersCount.toLocaleString()} followers
                    </p>
                  </div>
                </ResultRow>
              ))}
            </section>
          )}

          {/* ── Albums & Playlists ────────────────────────────────────────── */}
          {collections.length > 0 && (
            <section className="border-t border-[hsl(0,0%,13%)]">
              <SectionHeader label="Albums & Playlists" />
              {collections.map((col) => (
                <ResultRow key={col.id} onClick={() => handleSelect(col)}>
                  <Thumbnail src={col.coverUrl} fallback={<Disc size={14} className="text-gray-500" />} />
                  <div className="min-w-0">
                    <p className="text-white text-[13px] font-medium truncate">{col.title}</p>
                    <p className="text-gray-400 text-[11px] truncate capitalize">
                      {col.type} · {col.artist}
                    </p>
                  </div>
                </ResultRow>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Small reusable sub-components (private to this file) ─────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-4 py-2 text-[10px] uppercase tracking-widest text-gray-500 font-semibold bg-[hsl(0,0%,13%)]">
      {label}
    </div>
  );
}

function ResultRow({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[hsl(0,0%,15%)] transition-colors text-left"
    >
      {children}
    </button>
  );
}

function Thumbnail({
  src,
  fallback,
}: {
  src: string | null;
  fallback: React.ReactNode;
}) {
  return (
    <div className="w-9 h-9 rounded bg-[hsl(0,0%,12%)] flex items-center justify-center shrink-0 overflow-hidden">
      {src ? <img src={src} className="w-full h-full object-cover" /> : fallback}
    </div>
  );
}