import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RepostsPage from '../pages/RepostsPage';
import { engagementService } from '../services/engagementService';

vi.mock('../services/engagementService', () => ({
  engagementService: {
    getTrackReposts: vi.fn(),
  },
}));

const ARTIST = 'dj-sunshine';
const SONG = 'summer-vibes';

const mockReposts = [
  {
    id: 'repost1',
    userId: 'user5',
    trackId: `${ARTIST}/${SONG}`,
    createdAt: '2024-01-01T00:00:00Z',
    user: { id: 'user5', username: 'shareguru', avatarUrl: '' },
  },
  {
    id: 'repost2',
    userId: 'user6',
    trackId: `${ARTIST}/${SONG}`,
    createdAt: '2024-01-02T00:00:00Z',
    user: { id: 'user6', username: 'wavyrider', avatarUrl: '' },
  },
];

const renderRepostsPage = () =>
  render(
    <MemoryRouter initialEntries={[`/${ARTIST}/${SONG}/reposts`]}>
      <Routes>
        <Route path="/:artist/:songName/reposts" element={<RepostsPage />} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RepostsPage', () => {

  describe('loading state', () => {
    it('shows loading text while fetching', () => {
      vi.mocked(engagementService.getTrackReposts).mockReturnValue(new Promise(() => {}));
      renderRepostsPage();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty message when no reposts', async () => {
      vi.mocked(engagementService.getTrackReposts).mockResolvedValue([]);
      renderRepostsPage();
      await waitFor(() => expect(screen.getByText('No reposts yet')).toBeInTheDocument());
    });
  });

  describe('with reposts data', () => {
    beforeEach(() => {
      vi.mocked(engagementService.getTrackReposts).mockResolvedValue(mockReposts);
    });

    it('renders a card for each user who reposted', async () => {
      renderRepostsPage();
      await waitFor(() => expect(screen.getByText('shareguru')).toBeInTheDocument());
      expect(screen.getByText('wavyrider')).toBeInTheDocument();
    });

    it('renders Follow button for each user', async () => {
      renderRepostsPage();
      await waitFor(() => {
        const buttons = screen.getAllByRole('button', { name: /follow/i });
        expect(buttons).toHaveLength(mockReposts.length);
      });
    });

    it('renders back to track link', async () => {
      renderRepostsPage();
      await waitFor(() => expect(screen.getByText('Back to track')).toBeInTheDocument());
    });

    it('calls getTrackReposts with correct trackId', async () => {
      renderRepostsPage();
      await waitFor(() => {
        expect(engagementService.getTrackReposts).toHaveBeenCalledWith(`${ARTIST}/${SONG}`);
      });
    });
  });

  describe('tabs', () => {
    beforeEach(() => {
      vi.mocked(engagementService.getTrackReposts).mockResolvedValue([]);
    });

    it('renders Likes tab', async () => {
      renderRepostsPage();
      await waitFor(() => expect(screen.getByText('Likes')).toBeInTheDocument());
    });

    it('renders Reposts tab', async () => {
      renderRepostsPage();
      await waitFor(() => expect(screen.getByText('Reposts')).toBeInTheDocument());
    });

    it('renders In albums tab', async () => {
      renderRepostsPage();
      await waitFor(() => expect(screen.getByText('In albums')).toBeInTheDocument());
    });
  });

  describe('error state', () => {
    it('does not crash when API throws', async () => {
      vi.mocked(engagementService.getTrackReposts).mockRejectedValue(new Error('fail'));
      renderRepostsPage();
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });
});