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



const TRACK_ID = 'aaa-bbb-ccc-uuid';

const mockLikes = {
  likes: [
    {
      userId: 'user3',
      username: 'musiclover',
      displayName: 'Music Lover',
      avatarUrl: null,
      isCertified: false,
    },
    {
      userId: 'user4',
      username: 'beatfan',
      displayName: 'Beat Fan',
      avatarUrl: null,
      isCertified: false,
    },
  ],
  total: 2,
  page: 1,
  limit: 20,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

const emptyLikes = {
  likes: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};



const renderLikesPage = () =>
  render(
    <MemoryRouter initialEntries={[`/tracks/${TRACK_ID}/likes`]}>
      <Routes>
        <Route path="/tracks/:trackId/likes" element={<LikesPage />} />
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
    it('shows empty message when there are no likes', async () => {
      vi.mocked(engagementService.getTrackLikes).mockResolvedValue(emptyLikes);
      renderLikesPage();
      await waitFor(() =>
        expect(screen.getByText('No likes yet')).toBeInTheDocument()
      );
    });
  });

  describe('with likes data', () => {
    beforeEach(() => {
      vi.mocked(engagementService.getTrackLikes).mockResolvedValue(mockLikes);
    });

    it('renders a card for each user who liked', async () => {
      renderLikesPage();
      await waitFor(() =>
        expect(screen.getByText('Music Lover')).toBeInTheDocument()
      );
      expect(screen.getByText('Beat Fan')).toBeInTheDocument();
    });

    it('renders a Follow button for each user', async () => {
      renderLikesPage();
      await waitFor(() => {
        const buttons = screen.getAllByRole('button', { name: /follow/i });
        expect(buttons).toHaveLength(mockLikes.likes.length);
      });
    });

    it('renders the back-to-track link', async () => {
      renderLikesPage();
      await waitFor(() =>
        expect(screen.getByText('Back to track')).toBeInTheDocument()
      );
    });

    it('calls getTrackLikes with the correct trackId from URL params', async () => {
      renderLikesPage();
      await waitFor(() => {
        expect(engagementService.getTrackLikes).toHaveBeenCalledWith(TRACK_ID);
      });
    });
  });

  describe('tabs', () => {
    beforeEach(() => {
      vi.mocked(engagementService.getTrackLikes).mockResolvedValue(emptyLikes);
    });

  
    it('renders the likes tab', async () => {
      renderLikesPage();
      await waitFor(() =>
        expect(screen.getByText('likes')).toBeInTheDocument()
      );
    });

    it('renders the reposts tab', async () => {
      renderLikesPage();
      await waitFor(() =>
        expect(screen.getByText('reposts')).toBeInTheDocument()
      );
    });

    it('renders the In albums tab', async () => {
      renderLikesPage();
      await waitFor(() =>
        expect(screen.getByText('In albums')).toBeInTheDocument()
      );
    });

    it('marks the likes tab as active', async () => {
      renderLikesPage();
      await waitFor(() => {
        const likesTab = screen.getByText('likes');
        expect(likesTab).toHaveClass('border-white');
      });
    });
  });

  describe('error state', () => {
    it('does not crash and hides loading when API throws', async () => {
      vi.mocked(engagementService.getTrackLikes).mockRejectedValue(new Error('fail'));
      renderLikesPage();
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });
});
