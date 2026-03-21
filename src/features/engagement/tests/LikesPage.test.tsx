import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LikesPage from '../pages/LikesPage';
import { engagementService } from '../services/engagementService';

vi.mock('../services/engagementService', () => ({
  engagementService: {
    getTrackLikes: vi.fn(),
  },
}));

const ARTIST = 'dj-sunshine';
const SONG = 'summer-vibes';

const mockLikes = [
  {
    id: 'like1',
    userId: 'user3',
    trackId: `${ARTIST}/${SONG}`,
    createdAt: '2024-01-01T00:00:00Z',
    user: { id: 'user3', username: 'musiclover', avatarUrl: '' },
  },
  {
    id: 'like2',
    userId: 'user4',
    trackId: `${ARTIST}/${SONG}`,
    createdAt: '2024-01-02T00:00:00Z',
    user: { id: 'user4', username: 'beatfan', avatarUrl: '' },
  },
];

const renderLikesPage = () =>
  render(
    <MemoryRouter initialEntries={[`/${ARTIST}/${SONG}/likes`]}>
      <Routes>
        <Route path="/:artist/:songName/likes" element={<LikesPage />} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LikesPage', () => {

  describe('loading state', () => {
    it('shows loading text while fetching', () => {
      vi.mocked(engagementService.getTrackLikes).mockReturnValue(new Promise(() => {}));
      renderLikesPage();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty message when no likes', async () => {
      vi.mocked(engagementService.getTrackLikes).mockResolvedValue([]);
      renderLikesPage();
      await waitFor(() => expect(screen.getByText('No likes yet')).toBeInTheDocument());
    });
  });

  describe('with likes data', () => {
    beforeEach(() => {
      vi.mocked(engagementService.getTrackLikes).mockResolvedValue(mockLikes);
    });

    it('renders a card for each user who liked', async () => {
      renderLikesPage();
      await waitFor(() => expect(screen.getByText('musiclover')).toBeInTheDocument());
      expect(screen.getByText('beatfan')).toBeInTheDocument();
    });

    it('renders Follow button for each user', async () => {
      renderLikesPage();
      await waitFor(() => {
        const buttons = screen.getAllByRole('button', { name: /follow/i });
        expect(buttons).toHaveLength(mockLikes.length);
      });
    });

    it('renders back to track link', async () => {
      renderLikesPage();
      await waitFor(() => expect(screen.getByText('Back to track')).toBeInTheDocument());
    });

    it('calls getTrackLikes with correct trackId', async () => {
      renderLikesPage();
      await waitFor(() => {
        expect(engagementService.getTrackLikes).toHaveBeenCalledWith(`${ARTIST}/${SONG}`);
      });
    });
  });

  describe('tabs', () => {
  beforeEach(() => {
    vi.mocked(engagementService.getTrackLikes).mockResolvedValue([]);
  });

  it('renders Likes tab', async () => {
    renderLikesPage();
    await waitFor(() => expect(screen.getByText('likes')).toBeInTheDocument());
  });

  it('renders Reposts tab', async () => {
    renderLikesPage();
    await waitFor(() => expect(screen.getByText('reposts')).toBeInTheDocument());
  });

  it('renders In albums tab', async () => {
    renderLikesPage();
    await waitFor(() => expect(screen.getByText('In albums')).toBeInTheDocument());
  });
});

  describe('error state', () => {
    it('does not crash when API throws', async () => {
      vi.mocked(engagementService.getTrackLikes).mockRejectedValue(new Error('fail'));
      renderLikesPage();
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });
});