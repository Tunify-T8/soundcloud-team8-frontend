import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Music, Disc, BadgeCheck } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { feedService } from '@/features/feed/feedservice';
import type { RootState } from '@/app/store';
import type {
  SearchResult,
  TrackSearchResult,
  UserSearchResult,
  CollectionSearchResult,
} from '../../features/feed/type';
import avatarFallback from '@/assets/avatar.png';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setTimeout(() => {
        setResults([]);
        setIsLoading(false);
        setIsOpen(false);
      }, 0);
      return;
    }
    setTimeout(() => { setIsLoading(true); }, 0);
    feedService
      .search(debouncedQuery)
      .then((data) => {
        const sorted = [...data].sort((a, b) => b.score - a.score);
        setResults(sorted);
        setIsOpen(true);
      })
      .finally(() => setIsLoading(false));
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
    if (e.key === 'Enter' && query.trim()) {
      setIsOpen(false);
      setQuery('');
      if (currentUser && query.trim().toLowerCase() === currentUser.username.toLowerCase()) {
        navigate('/me');
      } else {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    if (result.type === 'user') {
      if (currentUser && result.username === currentUser.username) {
        navigate('/me');
      } else {
        navigate(`/${result.id}`);
      }
    } else if (result.type === 'track') {
      navigate(`/${result.artist}`);
    } else {
      navigate(`/${result.artist}`);
    }
  };

  const tracks      = results.filter((r): r is TrackSearchResult      => r.type === 'track');
  const users       = results.filter((r): r is UserSearchResult        => r.type === 'user');
  const collections = results.filter(
    (r): r is CollectionSearchResult => r.type === 'album' || r.type === 'playlist',
  );

  return (
    <div ref={containerRef} className="relative w-full" data-testid="search-bar-container">
      <div className="relative flex items-center">
        <Search size={14} className="absolute left-3 text-gray-400 pointer-events-none" />
        <input
          data-testid="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder="Search"
          className="w-full bg-[#333] text-white tracking-tight text-sm placeholder-gray-400 pl-8 pr-4 py-1.5 outline-none focus:bg-[#444] transition-colors"
        />
      </div>

      {isOpen && (
        <div
          data-testid="search-dropdown"
          className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[hsl(0,0%,20%)] rounded-md shadow-2xl z-50 max-h-[480px] overflow-y-auto"
        >
          {isLoading && (
            <div data-testid="search-loading" className="px-4 py-3 text-sm text-gray-400">
              Searching...
            </div>
          )}

          {!isLoading && results.length === 0 && (
            <div data-testid="search-no-results" className="px-4 py-3 text-sm text-gray-400">
              No results for "{debouncedQuery}"
            </div>
          )}

          {tracks.length > 0 && (
            <section data-testid="search-tracks-section">
              <SectionHeader label="Tracks" />
              {tracks.map((track) => (
                <ResultRow
                  key={track.id}
                  testId={`search-track-${track.id}`}
                  onClick={() => handleSelect(track)}
                >
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

          {users.length > 0 && (
            <section data-testid="search-people-section" className="border-t border-[hsl(0,0%,13%)]">
              <SectionHeader label="People" />
              {users.map((user) => (
                <ResultRow
                  key={user.id}
                  testId={`search-user-${user.id}`}
                  onClick={() => handleSelect(user)}
                >
                  <div className="w-9 h-9 rounded-full bg-[hsl(0,0%,22%)] shrink-0 overflow-hidden flex items-center justify-center">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.displayName ?? user.username}
                        data-testid={`search-user-avatar-${user.id}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={avatarFallback}
                        alt={user.displayName ?? user.username}
                        data-testid={`search-user-avatar-${user.id}`}
                        className="w-full h-full object-cover"
                      />
                    )}
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

          {collections.length > 0 && (
            <section data-testid="search-collections-section" className="border-t border-[hsl(0,0%,13%)]">
              <SectionHeader label="Albums & Playlists" />
              {collections.map((col) => (
                <ResultRow
                  key={col.id}
                  testId={`search-collection-${col.id}`}
                  onClick={() => handleSelect(col)}
                >
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

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-4 py-2 text-[10px] uppercase tracking-widest text-gray-500 font-semibold bg-[hsl(0,0%,13%)]">
      {label}
    </div>
  );
}

function ResultRow({
  onClick,
  testId,
  children,
}: {
  onClick: () => void;
  testId?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[hsl(0,0%,15%)] transition-colors text-left"
    >
      {children}
    </button>
  );
}

function Thumbnail({ src, fallback }: { src: string | null; fallback: React.ReactNode }) {
  return (
    <div className="w-9 h-9 rounded bg-[hsl(0,0%,12%)] flex items-center justify-center shrink-0 overflow-hidden">
      {src ? <img src={src} className="w-full h-full object-cover" /> : fallback}
    </div>
  );
}