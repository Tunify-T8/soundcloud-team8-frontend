import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SearchPage from '../pages/SearchPage';
import { feedService } from '../feedservice';
import type {
  TrackSearchResult,
  UserSearchResult,
  CollectionSearchResult,
} from '../type';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../feedservice', () => ({
  feedService: {
    search: vi.fn(),
  },
}));

vi.mock('../components/SearchResultItem', () => ({
  default: ({ result }: { result: { id: string; type: string; title?: string; username?: string } }) => (
    <div data-testid={`result-${result.id}`} data-type={result.type}>
      {result.title ?? result.username ?? result.id}
    </div>
  ),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockTrack: TrackSearchResult = {
  id: 'track-1',
  type: 'track',
  title: 'Mock Track',
  artist: 'Mock Artist',
  genre: null,
  durationSeconds: 180,
  coverUrl: null,
  likesCount: 10,
  playsCount: 100,
  allowDownloads: false,
  createdAt: new Date().toISOString(),
  score: 1.0,
};

const mockTrack2: TrackSearchResult = {
  ...mockTrack,
  id: 'track-2',
  title: 'Mock Track 2',
};

const mockUser: UserSearchResult = {
  id: 'user-1',
  type: 'user',
  username: 'mockuser',
  displayName: 'Mock User',
  bio: null,
  location: null,
  isCertified: false,
  followersCount: 50,
  score: 1.0,
};

const mockAlbum: CollectionSearchResult = {
  id: 'album-1',
  type: 'album',
  title: 'Mock Album',
  artist: 'Mock Artist',
  description: null,
  coverUrl: null,
  createdAt: new Date().toISOString(),
  score: 1.0,
};

const mockPlaylist: CollectionSearchResult = {
  id: 'playlist-1',
  type: 'playlist',
  title: 'Mock Playlist',
  artist: 'Mock Artist',
  description: null,
  coverUrl: null,
  createdAt: new Date().toISOString(),
  score: 1.0,
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function renderWithQuery(query = '', path = '/search') {
  const url = query ? `${path}?q=${encodeURIComponent(query)}` : path;
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SearchPage — filter sidebar', () => {
  beforeEach(() => {
    vi.mocked(feedService.search).mockResolvedValue([]);
  });

  it('renders all five filter buttons', async () => {
    renderWithQuery('test');
    await waitFor(() => {
      expect(screen.getByText('Everything')).toBeInTheDocument();
    });
    expect(screen.getByText('Tracks')).toBeInTheDocument();
    expect(screen.getByText('People')).toBeInTheDocument();
    expect(screen.getByText('Albums')).toBeInTheDocument();
    expect(screen.getByText('Playlists')).toBeInTheDocument();
  });

  it('"Everything" is active by default (white background)', () => {
    renderWithQuery('test');
    const btn = screen.getByText('Everything');
    expect(btn.className).toMatch(/bg-white/);
  });

  it('switches active filter when a button is clicked', async () => {
    renderWithQuery('test');
    await waitFor(() => screen.getByText('Tracks'));
    fireEvent.click(screen.getByText('Tracks'));
    expect(screen.getByText('Tracks').className).toMatch(/bg-white/);
    expect(screen.getByText('Everything').className).not.toMatch(/bg-white/);
  });

  it('calls feedService.search with correct type when filter changes', async () => {
    renderWithQuery('jazz');
    await waitFor(() => screen.getByText('Tracks'));
    fireEvent.click(screen.getByText('Tracks'));
    await waitFor(() => {
      expect(feedService.search).toHaveBeenCalledWith('jazz', 'track');
    });
  });

  it('calls feedService.search without type when "Everything" is selected', async () => {
    renderWithQuery('jazz');
    await waitFor(() => screen.getByText('Tracks'));
    // Switch away first, then back to Everything
    fireEvent.click(screen.getByText('Tracks'));
    fireEvent.click(screen.getByText('Everything'));
    await waitFor(() => {
      const calls = vi.mocked(feedService.search).mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[1]).toBeUndefined();
    });
  });

  it('uses "user" type when People filter is selected', async () => {
    renderWithQuery('artist');
    await waitFor(() => screen.getByText('People'));
    fireEvent.click(screen.getByText('People'));
    await waitFor(() => {
      expect(feedService.search).toHaveBeenCalledWith('artist', 'user');
    });
  });

  it('uses "album" type when Albums filter is selected', async () => {
    renderWithQuery('rock');
    await waitFor(() => screen.getByText('Albums'));
    fireEvent.click(screen.getByText('Albums'));
    await waitFor(() => {
      expect(feedService.search).toHaveBeenCalledWith('rock', 'album');
    });
  });

  it('uses "playlist" type when Playlists filter is selected', async () => {
    renderWithQuery('chill');
    await waitFor(() => screen.getByText('Playlists'));
    fireEvent.click(screen.getByText('Playlists'));
    await waitFor(() => {
      expect(feedService.search).toHaveBeenCalledWith('chill', 'playlist');
    });
  });

  it('renders legal footer links in the sidebar', async () => {
    renderWithQuery('test');
    await waitFor(() => screen.getByText('Legal'));
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Imprint')).toBeInTheDocument();
  });
});

describe('SearchPage — heading and query display', () => {
  beforeEach(() => {
    vi.mocked(feedService.search).mockResolvedValue([]);
  });

  it('shows the query in the heading', async () => {
    renderWithQuery('lofi beats');
    await waitFor(() => {
      expect(screen.getByText(/"lofi beats"/)).toBeInTheDocument();
    });
  });

  it('does NOT show a heading when query is empty', () => {
    renderWithQuery('');
    expect(screen.queryByText(/Search results for/)).not.toBeInTheDocument();
  });
});

describe('SearchPage — loading state', () => {
  it('shows "Searching..." while the request is in flight', async () => {
    // Never resolves during this test
    vi.mocked(feedService.search).mockReturnValue(new Promise(() => {}));
    renderWithQuery('hip hop');
    await waitFor(() => {
      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });
  });
});

describe('SearchPage — empty state', () => {
  beforeEach(() => {
    vi.mocked(feedService.search).mockResolvedValue([]);
  });

  it('shows no-results message after an empty response', async () => {
    renderWithQuery('xyznotexist');
    await waitFor(() => {
      expect(screen.getByText(/No results for "xyznotexist"/)).toBeInTheDocument();
    });
  });

  it('does not show no-results message when query is empty', async () => {
    renderWithQuery('');
    await waitFor(() => {
      expect(screen.queryByText(/No results for/)).not.toBeInTheDocument();
    });
  });
});

describe('SearchPage — results rendering', () => {
  it('renders track result items', async () => {
    vi.mocked(feedService.search).mockResolvedValue([mockTrack]);
    renderWithQuery('track');
    await waitFor(() => {
      expect(screen.getByTestId('result-track-1')).toBeInTheDocument();
    });
  });

  it('renders user result items', async () => {
    vi.mocked(feedService.search).mockResolvedValue([mockUser]);
    renderWithQuery('user');
    await waitFor(() => {
      expect(screen.getByTestId('result-user-1')).toBeInTheDocument();
    });
  });

  it('renders album result items', async () => {
    vi.mocked(feedService.search).mockResolvedValue([mockAlbum]);
    renderWithQuery('album');
    await waitFor(() => {
      expect(screen.getByTestId('result-album-1')).toBeInTheDocument();
    });
  });

  it('renders playlist result items', async () => {
    vi.mocked(feedService.search).mockResolvedValue([mockPlaylist]);
    renderWithQuery('playlist');
    await waitFor(() => {
      expect(screen.getByTestId('result-playlist-1')).toBeInTheDocument();
    });
  });

  it('renders multiple mixed results', async () => {
    vi.mocked(feedService.search).mockResolvedValue([mockTrack, mockUser, mockAlbum]);
    renderWithQuery('mixed');
    await waitFor(() => {
      expect(screen.getByTestId('result-track-1')).toBeInTheDocument();
      expect(screen.getByTestId('result-user-1')).toBeInTheDocument();
      expect(screen.getByTestId('result-album-1')).toBeInTheDocument();
    });
  });

  it('passes result id as key (no duplicate key warnings)', async () => {
    vi.mocked(feedService.search).mockResolvedValue([mockTrack, mockTrack2]);
    renderWithQuery('track');
    await waitFor(() => {
      expect(screen.getByTestId('result-track-1')).toBeInTheDocument();
      expect(screen.getByTestId('result-track-2')).toBeInTheDocument();
    });
  });
});

describe('SearchPage — summary line', () => {
  it('shows track count in summary', async () => {
    vi.mocked(feedService.search).mockResolvedValue([mockTrack]);
    renderWithQuery('track');
    await waitFor(() => {
      expect(screen.getByText(/1 track/)).toBeInTheDocument();
    });
  });

  it('pluralises "tracks" correctly', async () => {
    vi.mocked(feedService.search).mockResolvedValue([mockTrack, mockTrack2]);
    renderWithQuery('tracks');
    await waitFor(() => {
      expect(screen.getByText(/2 tracks/)).toBeInTheDocument();
    });
  });

  it('shows person count in summary (singular)', async () => {
    vi.mocked(feedService.search).mockResolvedValue([mockUser]);
    renderWithQuery('user');
    await waitFor(() => {
      expect(screen.getByText(/1 person/)).toBeInTheDocument();
    });
  });

  it('shows people count in summary (plural)', async () => {
    const user2: UserSearchResult = { ...mockUser, id: 'user-2' };
    vi.mocked(feedService.search).mockResolvedValue([mockUser, user2]);
    renderWithQuery('users');
    await waitFor(() => {
      expect(screen.getByText(/2 people/)).toBeInTheDocument();
    });
  });

  it('shows playlist count in summary', async () => {
    vi.mocked(feedService.search).mockResolvedValue([mockAlbum]);
    renderWithQuery('album');
    await waitFor(() => {
      expect(screen.getByText(/1 playlist/)).toBeInTheDocument();
    });
  });

  it('pluralises "playlists" correctly', async () => {
    vi.mocked(feedService.search).mockResolvedValue([mockAlbum, mockPlaylist]);
    renderWithQuery('collections');
    await waitFor(() => {
      expect(screen.getByText(/2 playlists/)).toBeInTheDocument();
    });
  });

  it('combines all types in the summary line', async () => {
    vi.mocked(feedService.search).mockResolvedValue([mockTrack, mockUser, mockAlbum]);
    renderWithQuery('everything');
    await waitFor(() => {
      const summary = screen.getByText(/Found/);
      expect(summary.textContent).toMatch(/playlist/);
      expect(summary.textContent).toMatch(/track/);
      expect(summary.textContent).toMatch(/person/);
    });
  });

  it('does not show summary while loading', () => {
    vi.mocked(feedService.search).mockReturnValue(new Promise(() => {}));
    renderWithQuery('loading');
    expect(screen.queryByText(/Found/)).not.toBeInTheDocument();
  });

  it('does not show summary when results are empty', async () => {
    vi.mocked(feedService.search).mockResolvedValue([]);
    renderWithQuery('empty');
    await waitFor(() => {
      expect(screen.queryByText(/Found/)).not.toBeInTheDocument();
    });
  });
});

describe('SearchPage — refetch on query change', () => {
  it('calls feedService.search again when the query changes', async () => {
    vi.mocked(feedService.search).mockResolvedValue([]);

    // First render with query "a"
    const { unmount } = renderWithQuery('a');
    await waitFor(() => {
      expect(feedService.search).toHaveBeenCalledWith('a', undefined);
    });
    unmount();

    // Re-render with query "b"
    renderWithQuery('b');
    await waitFor(() => {
      expect(feedService.search).toHaveBeenCalledWith('b', undefined);
    });
  });
});