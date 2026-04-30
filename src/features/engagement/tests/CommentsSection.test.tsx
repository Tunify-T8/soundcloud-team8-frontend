
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
vi.mock('@/features/engagement/services/engagementService', () => ({
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

// ✅ Imports come after vi.mock
import CommentsSection from '@/features/engagement/components/CommentsSection';
import { engagementService } from '@/features/engagement/services/engagementService';

const mockComment = {
  commentId: '1',
  text: 'hello',
  user: {
    userId: 'u1',
    username: 'john',
    avatarUrl: null,
  },
  timestamp: 0,
  likesCount: 0,
  repliesCount: 0,
  isLiked: false,
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CommentsSection', () => {
  it('renders empty state', async () => {
    (engagementService.getTrackComments as ReturnType<typeof vi.fn>)
      .mockResolvedValue({ comments: [] });

    render(<CommentsSection trackId="1" commentCount={0} />);

    expect(await screen.findByText(/No comments yet/i)).toBeInTheDocument();
  });

  it('renders a list of comments', async () => {
    (engagementService.getTrackComments as ReturnType<typeof vi.fn>)
      .mockResolvedValue({ comments: [mockComment] });

    render(<CommentsSection trackId="1" commentCount={1} />);

    expect(await screen.findByText('john')).toBeInTheDocument();
    expect(await screen.findByText('hello')).toBeInTheDocument();
  });

  it('posts a comment on Enter key', async () => {
    (engagementService.getTrackComments as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ comments: [] })
      .mockResolvedValueOnce({ comments: [mockComment] });

    (engagementService.postComment as ReturnType<typeof vi.fn>)
      .mockResolvedValue({});

    render(<CommentsSection trackId="1" commentCount={0} />);

    const input = await screen.findByPlaceholderText('Write a comment');
    fireEvent.change(input, { target: { value: 'hello' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(engagementService.postComment).toHaveBeenCalledWith('1', 'hello', expect.any(Number));
    });

    expect(await screen.findByText('john')).toBeInTheDocument();
  });

  it('deletes a comment when owner', async () => {
    (engagementService.getTrackComments as ReturnType<typeof vi.fn>)
      .mockResolvedValue({ comments: [mockComment] });

    (engagementService.deleteComment as ReturnType<typeof vi.fn>)
      .mockResolvedValue({});

    // currentUserId matches mockComment.user.userId → delete button appears
    render(
      <CommentsSection trackId="1" commentCount={1} currentUserId="u1" />
    );

    const deleteBtn = await screen.findByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(engagementService.deleteComment).toHaveBeenCalledWith('1');
    });

    // comment should be removed from UI
    await waitFor(() => {
      expect(screen.queryByText('hello')).not.toBeInTheDocument();
    });
  });

  it('toggles like on a comment', async () => {
    (engagementService.getTrackComments as ReturnType<typeof vi.fn>)
      .mockResolvedValue({ comments: [mockComment] });

    (engagementService.likeComment as ReturnType<typeof vi.fn>)
      .mockResolvedValue({});

    render(<CommentsSection trackId="1" commentCount={1} />);

    // The heart button is the only button next to the comment
    const likeButtons = await screen.findAllByRole('button');
    // Heart button is last in the comment row
    const heartBtn = likeButtons[likeButtons.length - 1];
    fireEvent.click(heartBtn);

    await waitFor(() => {
      expect(engagementService.likeComment).toHaveBeenCalledWith('1');
    });
  });
});