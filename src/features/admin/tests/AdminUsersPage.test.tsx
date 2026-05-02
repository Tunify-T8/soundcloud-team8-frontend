import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AdminUsersPage from '../pages/AdminUsersPage';
import { adminServices } from '../services/adminServices';
import { profileService } from '../../profile/profileService';
import { feedService } from '@/features/feed/feedservice';

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

vi.mock('@/features/feed/feedservice', () => ({
  feedService: {
    search: vi.fn(),
  },
}));

vi.mock('../../profile/profileService', () => ({
  profileService: {
    getPublicProfile: vi.fn(),
  },
}));

vi.mock('../services/adminServices', () => ({
  adminServices: {
    users: {
      getModeration: vi.fn(),
      suspend: vi.fn(),
      unsuspend: vi.fn(),
      ban: vi.fn(),
    },
  },
}));

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(feedService.search).mockResolvedValue([
      {
        id: 'user-123',
        type: 'user',
        username: 'rosana',
        displayName: 'Rosana',
        avatarUrl: null,
        bio: null,
        location: null,
        isCertified: false,
        followersCount: 14,
        score: 1,
      },
    ] as never);
    vi.mocked(profileService.getPublicProfile).mockResolvedValue({
      id: 'user-123',
      username: 'rosana',
      displayName: 'Rosana',
      role: 'LISTENER',
      bio: null,
      location: null,
      avatarUrl: null,
      coverUrl: null,
      followersCount: 14,
      followingCount: 3,
      tracksUploadedCount: 0,
    } as never);
    vi.mocked(adminServices.users.getModeration).mockResolvedValue({
      userId: 'user-123',
      isSuspended: false,
      isBanned: false,
      suspendedUntil: null,
      suspensionReason: null,
    } as never);
  });

  it('shows search results under the input and only loads moderation on button click', async () => {
    const user = userEvent.setup();
    render(<AdminUsersPage />);

    const input = screen.getByPlaceholderText('Paste a user UUID here');
    await user.type(input, 'rosana');

    const resultLabel = await screen.findByText(/@rosana · 14 followers/i);
    const resultButton = resultLabel.closest('button');
    expect(resultButton).not.toBeNull();

    await user.click(resultButton!);
    expect(input).toHaveValue('user-123');
    expect(adminServices.users.getModeration).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /load user/i }));

    await waitFor(() => {
      expect(profileService.getPublicProfile).toHaveBeenCalledWith('user-123');
      expect(adminServices.users.getModeration).toHaveBeenCalledWith('user-123');
    });
  });
});