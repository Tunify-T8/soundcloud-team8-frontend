// src/features/conversation/components/__tests__/UserCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserCard from '../components/UserCard';
import { api } from '../../auth/services/api';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../auth/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('UserCard', () => {
  it('renders user and follows/unfollows', async () => {
    (api.get as any).mockResolvedValue({
      data: { followersCount: 10, isFollowing: false },
    });

    (api.post as any).mockResolvedValue({});
    (api.delete as any).mockResolvedValue({});

    render(
      <MemoryRouter>
        <UserCard userId="1" avatarUrl="" username="john" />
      </MemoryRouter>
    );

    expect(await screen.findByText('john')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Follow'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });
  });
});