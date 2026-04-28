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



const TRACK_ID = 'aaa-bbb-ccc-uuid';

const mockReposts = {
  reposts: [
    {
      repostId: 'repost1',
      userId: 'user5',
      username: 'shareguru',
      displayName: 'Share Guru',
      avatarUrl: null,
      isCertified: false,
      repostedAt: '2024-01-01T00:00:00Z',
    },
    {
      repostId: 'repost2',
      userId: 'user6',
      username: 'wavyrider',
      displayName: 'Wavy Rider',
      avatarUrl: null,
      isCertified: false,
      repostedAt: '2024-01-02T00:00:00Z',
    },
  ],
  total: 2,
  page: 1,
  limit: 20,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

const emptyReposts = {
  reposts: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};



const renderRepostsPage = () =>
  render(
    <MemoryRouter initialEntries={[`/tracks/${TRACK_ID}/reposts`]}>
      <Routes>
        <Route path="/tracks/:trackId/reposts" element={<RepostsPage />} />
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
    it('shows empty message when there are no reposts', async () => {
      vi.mocked(engagementService.getTrackReposts).mockResolvedValue(emptyReposts);
      renderRepostsPage();
      await waitFor(() =>
        expect(screen.getByText('No reposts yet')).toBeInTheDocument()
      );
    });
  });

  describe('with reposts data', () => {
    beforeEach(() => {
      vi.mocked(engagementService.getTrackReposts).mockResolvedValue(mockReposts);
    });

    it('renders a card for each user who reposted', async () => {
      renderRepostsPage();
      await waitFor(() =>
        expect(screen.getByText('Share Guru')).toBeInTheDocument()
      );
      expect(screen.getByText('Wavy Rider')).toBeInTheDocument();
    });

    it('renders a Follow button for each user', async () => {
      renderRepostsPage();
      await waitFor(() => {
        const buttons = screen.getAllByRole('button', { name: /follow/i });
        expect(buttons).toHaveLength(mockReposts.reposts.length);
      });
    });

    it('renders the back-to-track link', async () => {
      renderRepostsPage();
      await waitFor(() =>
        expect(screen.getByText('Back to track')).toBeInTheDocument()
      );
    });

    it('calls getTrackReposts with the correct trackId from URL params', async () => {
      renderRepostsPage();
      await waitFor(() => {
        expect(engagementService.getTrackReposts).toHaveBeenCalledWith(TRACK_ID);
      });
    });
  });

  describe('tabs', () => {
    beforeEach(() => {
      vi.mocked(engagementService.getTrackReposts).mockResolvedValue(emptyReposts);
    });

    
    it('renders the likes tab', async () => {
      renderRepostsPage();
      await waitFor(() =>
        expect(screen.getByText('likes')).toBeInTheDocument()
      );
    });

    it('renders the reposts tab', async () => {
      renderRepostsPage();
      await waitFor(() =>
        expect(screen.getByText('reposts')).toBeInTheDocument()
      );
    });

    it('renders the In albums tab', async () => {
      renderRepostsPage();
      await waitFor(() =>
        expect(screen.getByText('In albums')).toBeInTheDocument()
      );
    });

    it('marks the reposts tab as active', async () => {
      renderRepostsPage();
      await waitFor(() => {
        const repostsTab = screen.getByText('reposts');
        expect(repostsTab).toHaveClass('border-white');
      });
    });
  });

  describe('error state', () => {
    it('does not crash and hides loading when API throws', async () => {
      vi.mocked(engagementService.getTrackReposts).mockRejectedValue(new Error('fail'));
      renderRepostsPage();
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });
});
