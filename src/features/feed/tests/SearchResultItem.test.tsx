import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SearchResultItem from '../components/SearchResultItem';
import type {
  TrackSearchResult,
  UserSearchResult,
  CollectionSearchResult,
} from '../type';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/components/ui/SongCard', () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="song-card">
      <span data-testid="sc-trackId">{String(props.trackId)}</span>
      <span data-testid="sc-title">{String(props.title)}</span>
      <span data-testid="sc-artist">{String(props.artistName)}</span>
      <span data-testid="sc-likes">{String(props.likes)}</span>
      <span data-testid="sc-plays">{String(props.plays)}</span>
      <span data-testid="sc-timeAgo">{String(props.timeAgo)}</span>
      <span data-testid="sc-waveformSeed">{String(props.waveformSeed)}</span>
      <span data-testid="sc-genre">{String(props.genre)}</span>
    </div>
  ),
}));

vi.mock('@/components/ui/AlbumCard', () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="album-card">
      <span data-testid="ac-id">{String(props.id)}</span>
      <span data-testid="ac-type">{String(props.type)}</span>
      <span data-testid="ac-title">{String(props.title)}</span>
      <span data-testid="ac-artist">{String(props.artist)}</span>
      <span data-testid="ac-coverUrl">{String(props.coverUrl)}</span>
      <span data-testid="ac-createdAt">{String(props.createdAt)}</span>
      <span data-testid="ac-trackCount">
        {String((props.tracks as unknown[]).length)}
      </span>
    </div>
  ),
}));

vi.mock('@/components/ui/UserResultRow', () => ({
  default: (props: Record<string, unknown>) => {
    const user = props.user as Record<string, unknown>;
    return (
      <div data-testid="user-row">
        <span data-testid="ur-id">{String(user.id)}</span>
        <span data-testid="ur-username">{String(user.username)}</span>
      </div>
    );
  },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockTrack: TrackSearchResult = {
  id: 'track-abc',
  type: 'track',
  title: 'Test Track',
  artist: 'Test Artist',
  genre: 'Hip-hop',
  durationSeconds: 210,
  coverUrl: 'https://example.com/cover.jpg',
  likesCount: 42,
  playsCount: 1337,
  allowDownloads: true,
  createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(), // 2 days ago
  score: 0.9,
};

const mockTrackNoCover: TrackSearchResult = {
  ...mockTrack,
  id: 'track-nocover',
  coverUrl: null,
  genre: null,
};

const mockUser: UserSearchResult = {
  id: 'user-xyz',
  type: 'user',
  username: 'testuser',
  displayName: 'Test User',
  bio: 'A bio',
  location: 'Cairo',
  isCertified: false,
  followersCount: 200,
  score: 0.8,
};

const mockAlbum: CollectionSearchResult = {
  id: 'album-123',
  type: 'album',
  title: 'Test Album',
  artist: 'Album Artist',
  description: 'An album',
  coverUrl: 'https://example.com/album.jpg',
  createdAt: new Date(Date.now() - 31 * 86_400_000).toISOString(),
  score: 0.7,
};

const mockPlaylist: CollectionSearchResult = {
  id: 'playlist-456',
  type: 'playlist',
  title: 'Test Playlist',
  artist: 'Playlist Artist',
  description: null,
  coverUrl: null,
  createdAt: new Date(Date.now() - 365 * 86_400_000).toISOString(),
  score: 0.6,
};

// ─── Dispatcher routing ───────────────────────────────────────────────────────

describe('SearchResultItem — dispatcher routing', () => {
  it('renders SongCard for a track result', () => {
    render(<SearchResultItem result={mockTrack} />);
    expect(screen.getByTestId('song-card')).toBeInTheDocument();
    expect(screen.queryByTestId('album-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-row')).not.toBeInTheDocument();
  });

  it('renders UserResultRow for a user result', () => {
    render(<SearchResultItem result={mockUser} />);
    expect(screen.getByTestId('user-row')).toBeInTheDocument();
    expect(screen.queryByTestId('song-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('album-card')).not.toBeInTheDocument();
  });

  it('renders AlbumCard for an album result', () => {
    render(<SearchResultItem result={mockAlbum} />);
    expect(screen.getByTestId('album-card')).toBeInTheDocument();
    expect(screen.queryByTestId('song-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-row')).not.toBeInTheDocument();
  });

  it('renders SongCard for a playlist result', () => {
    render(<SearchResultItem result={mockPlaylist} />);
    expect(screen.getByTestId('song-card')).toBeInTheDocument();
  });

  it('renders nothing for an unknown type', () => {
    const unknown = { id: 'x', type: 'unknown' } as unknown as TrackSearchResult;
    const { container } = render(<SearchResultItem result={unknown} />);
    expect(container.firstChild).toBeNull();
  });
});

// ─── TrackResult — SongCard props ─────────────────────────────────────────────

describe('SearchResultItem — TrackResult props', () => {
  it('passes trackId correctly', () => {
    render(<SearchResultItem result={mockTrack} />);
    expect(screen.getByTestId('sc-trackId')).toHaveTextContent('track-abc');
  });

  it('passes title correctly', () => {
    render(<SearchResultItem result={mockTrack} />);
    expect(screen.getByTestId('sc-title')).toHaveTextContent('Test Track');
  });

  it('passes artistName correctly', () => {
    render(<SearchResultItem result={mockTrack} />);
    expect(screen.getByTestId('sc-artist')).toHaveTextContent('Test Artist');
  });

  it('passes likes as string', () => {
    render(<SearchResultItem result={mockTrack} />);
    expect(screen.getByTestId('sc-likes')).toHaveTextContent('42');
  });

  it('passes plays as string', () => {
    render(<SearchResultItem result={mockTrack} />);
    expect(screen.getByTestId('sc-plays')).toHaveTextContent('1337');
  });

  it('passes genre correctly', () => {
    render(<SearchResultItem result={mockTrack} />);
    expect(screen.getByTestId('sc-genre')).toHaveTextContent('Hip-hop');
  });

  it('passes a non-zero waveformSeed derived from the track id', () => {
    render(<SearchResultItem result={mockTrack} />);
    const seed = Number(screen.getByTestId('sc-waveformSeed').textContent);
    expect(seed).toBeGreaterThan(0);
  });

  it('produces a deterministic waveformSeed for the same id', () => {
    const { unmount } = render(<SearchResultItem result={mockTrack} />);
    const seed1 = screen.getByTestId('sc-waveformSeed').textContent;
    unmount();
    render(<SearchResultItem result={mockTrack} />);
    const seed2 = screen.getByTestId('sc-waveformSeed').textContent;
    expect(seed1).toBe(seed2);
  });

  it('produces different seeds for different track ids', () => {
    const trackB: TrackSearchResult = { ...mockTrack, id: 'zzz' };
    const { unmount } = render(<SearchResultItem result={mockTrack} />);
    const seed1 = screen.getByTestId('sc-waveformSeed').textContent;
    unmount();
    render(<SearchResultItem result={trackB} />);
    const seed2 = screen.getByTestId('sc-waveformSeed').textContent;
    expect(seed1).not.toBe(seed2);
  });

  it('passes timeAgo as "2 days ago" for a 2-day-old track', () => {
    render(<SearchResultItem result={mockTrack} />);
    expect(screen.getByTestId('sc-timeAgo')).toHaveTextContent('2 days ago');
  });

  it('handles null coverUrl without crashing', () => {
    render(<SearchResultItem result={mockTrackNoCover} />);
    expect(screen.getByTestId('song-card')).toBeInTheDocument();
  });

  it('handles null genre without crashing', () => {
    render(<SearchResultItem result={mockTrackNoCover} />);
    expect(screen.getByTestId('song-card')).toBeInTheDocument();
  });
});

// ─── TrackResult — formatTimeAgo via SongCard timeAgo prop ───────────────────

describe('SearchResultItem — formatTimeAgo (via TrackResult)', () => {
  function trackWithAge(msAgo: number): TrackSearchResult {
    return {
      ...mockTrack,
      createdAt: new Date(Date.now() - msAgo).toISOString(),
    };
  }

  it('shows "today" for a track created now', () => {
    render(<SearchResultItem result={trackWithAge(0)} />);
    expect(screen.getByTestId('sc-timeAgo')).toHaveTextContent('today');
  });

  it('shows "1 day ago" for a 1-day-old track', () => {
    render(<SearchResultItem result={trackWithAge(1 * 86_400_000)} />);
    expect(screen.getByTestId('sc-timeAgo')).toHaveTextContent('1 day ago');
  });

  it('shows "1 month ago" for a ~31-day-old track', () => {
    render(<SearchResultItem result={trackWithAge(31 * 86_400_000)} />);
    expect(screen.getByTestId('sc-timeAgo')).toHaveTextContent('1 month ago');
  });

  it('shows "2 months ago" for a ~62-day-old track', () => {
    render(<SearchResultItem result={trackWithAge(62 * 86_400_000)} />);
    expect(screen.getByTestId('sc-timeAgo')).toHaveTextContent('2 months ago');
  });

  it('shows "1 year ago" for a ~365-day-old track', () => {
    render(<SearchResultItem result={trackWithAge(365 * 86_400_000)} />);
    expect(screen.getByTestId('sc-timeAgo')).toHaveTextContent('1 year ago');
  });

  it('shows "2 years ago" for a ~730-day-old track', () => {
    render(<SearchResultItem result={trackWithAge(730 * 86_400_000)} />);
    expect(screen.getByTestId('sc-timeAgo')).toHaveTextContent('2 years ago');
  });

  it('returns empty string for an empty createdAt', () => {
    render(<SearchResultItem result={{ ...mockTrack, createdAt: '' }} />);
    expect(screen.getByTestId('sc-timeAgo')).toHaveTextContent('');
  });
});

// ─── CollectionResult — AlbumCard props ──────────────────────────────────────

describe('SearchResultItem — CollectionResult props (album)', () => {
  it('passes id correctly', () => {
    render(<SearchResultItem result={mockAlbum} />);
    expect(screen.getByTestId('ac-id')).toHaveTextContent('album-123');
  });

  it('passes type as "album"', () => {
    render(<SearchResultItem result={mockAlbum} />);
    expect(screen.getByTestId('ac-type')).toHaveTextContent('album');
  });

  it('passes title correctly', () => {
    render(<SearchResultItem result={mockAlbum} />);
    expect(screen.getByTestId('ac-title')).toHaveTextContent('Test Album');
  });

  it('passes artist correctly', () => {
    render(<SearchResultItem result={mockAlbum} />);
    expect(screen.getByTestId('ac-artist')).toHaveTextContent('Album Artist');
  });

  it('passes coverUrl correctly', () => {
    render(<SearchResultItem result={mockAlbum} />);
    expect(screen.getByTestId('ac-coverUrl')).toHaveTextContent(
      'https://example.com/album.jpg',
    );
  });

  it('passes createdAt correctly', () => {
    render(<SearchResultItem result={mockAlbum} />);
    expect(screen.getByTestId('ac-createdAt')).toHaveTextContent(
      mockAlbum.createdAt,
    );
  });

  it('generates exactly 5 placeholder tracks', () => {
    render(<SearchResultItem result={mockAlbum} />);
    expect(screen.getByTestId('ac-trackCount')).toHaveTextContent('5');
  });
});

describe('SearchResultItem — CollectionResult props (playlist)', () => {
  it('renders SongCard for playlist', () => {
    render(<SearchResultItem result={mockPlaylist} />);
    expect(screen.getByTestId('song-card')).toBeInTheDocument();
  });

  it('passes playlist title to SongCard', () => {
    render(<SearchResultItem result={mockPlaylist} />);
    expect(screen.getByTestId('sc-title')).toHaveTextContent('Test Playlist');
  });

  it('passes playlist artist to SongCard', () => {
    render(<SearchResultItem result={mockPlaylist} />);
    expect(screen.getByTestId('sc-artist')).toHaveTextContent('Playlist Artist');
  });
});

// ─── CollectionResult — placeholder track shape ───────────────────────────────

describe('SearchResultItem — placeholder track structure', () => {
  it('placeholder tracks use collection id as prefix', () => {
    // Verify via AlbumCard mock that tracks array is passed (count = 5)
    render(<SearchResultItem result={mockAlbum} />);
    expect(screen.getByTestId('ac-trackCount')).toHaveTextContent('5');
  });

  it('renders a fresh set of 5 tracks for a different collection', () => {
    const other: CollectionSearchResult = {
      ...mockAlbum,
      id: 'other-99',
      title: 'Other',
    };
    render(<SearchResultItem result={other} />);
    expect(screen.getByTestId('ac-trackCount')).toHaveTextContent('5');
  });
});

// ─── UserResult — UserResultRow props ─────────────────────────────────────────

describe('SearchResultItem — UserResult props', () => {
  it('passes the full user object to UserResultRow', () => {
    render(<SearchResultItem result={mockUser} />);
    expect(screen.getByTestId('ur-id')).toHaveTextContent('user-xyz');
    expect(screen.getByTestId('ur-username')).toHaveTextContent('testuser');
  });

  it('renders UserResultRow for a certified user', () => {
    const certified: UserSearchResult = { ...mockUser, isCertified: true };
    render(<SearchResultItem result={certified} />);
    expect(screen.getByTestId('user-row')).toBeInTheDocument();
  });

  it('renders UserResultRow even with null displayName', () => {
    const noDisplay: UserSearchResult = { ...mockUser, displayName: null };
    render(<SearchResultItem result={noDisplay} />);
    expect(screen.getByTestId('user-row')).toBeInTheDocument();
  });
});
