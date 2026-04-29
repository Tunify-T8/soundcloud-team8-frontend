import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CommentsSection from '../components/CommentsSection';
import { engagementService } from '../services/engagementService';
import { HIDDEN_COMMENT_IDS_KEY } from '@/features/admin/utils/hiddenComments';
import userReducer from '@/store/userSlice';

vi.mock('../services/engagementService', () => ({
  engagementService: {
    getTrackComments: vi.fn(),
    postComment: vi.fn(),
    deleteComment: vi.fn(),
    likeComment: vi.fn(),
    unlikeComment: vi.fn(),
    getReplies: vi.fn(),
    postReply: vi.fn(),
  },
}));

describe('CommentsSection', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const renderWithStore = (ui: React.ReactElement) => {
    const store = configureStore({
      reducer: {
        user: userReducer,
      },
    });

    store.dispatch({
      type: 'user/setUser',
      payload: {
        id: 'admin-user',
        username: 'admin',
        displayName: 'Admin User',
        email: 'admin@test.com',
        role: 'admin',
        isVerified: true,
        avatarUrl: null,
      },
    });

    return render(<Provider store={store}>{ui}</Provider>);
  };

  it('hides comments that were moderated by an admin', async () => {
    localStorage.setItem(HIDDEN_COMMENT_IDS_KEY, JSON.stringify(['comment-hidden']));

    vi.mocked(engagementService.getTrackComments).mockResolvedValue({
      comments: [
        {
          commentId: 'comment-hidden',
          trackId: 'track-1',
          user: { userId: 'u1', username: 'Hidden User', avatarUrl: null },
          text: 'This should not be visible',
          timestamp: 0,
          likesCount: 0,
          repliesCount: 0,
          isLiked: false,
          createdAt: '2026-04-30T00:00:00.000Z',
        },
        {
          commentId: 'comment-visible',
          trackId: 'track-1',
          user: { userId: 'u2', username: 'Visible User', avatarUrl: null },
          text: 'This should be visible',
          timestamp: 0,
          likesCount: 0,
          repliesCount: 0,
          isLiked: false,
          createdAt: '2026-04-30T00:00:00.000Z',
        },
      ],
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    } as never);

    renderWithStore(<CommentsSection trackId="track-1" commentCount={2} />);

    await waitFor(() => {
      expect(screen.getByText('This should be visible')).toBeInTheDocument();
    });

    expect(screen.queryByText('This should not be visible')).toBeNull();
  });
});