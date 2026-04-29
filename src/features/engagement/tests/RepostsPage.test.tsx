import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { engagementService } from '../services/engagementService';
import RepostsPage from '../pages/RepostsPage';

// mock service
vi.mock('../services/engagementService', () => ({
  engagementService: {
    getTrackReposts: vi.fn(),
  },
}));

describe('RepostsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders reposts', async () => {
    (engagementService.getTrackReposts as any).mockResolvedValue({
      reposts: [
        {
          repostId: '1',
          userId: 'u1',
          username: 'john',
          displayName: 'John',
          avatarUrl: null,
          isCertified: false,
          repostedAt: '2026-01-01',
        },
      ],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });

    render(
      <MemoryRouter initialEntries={['/tracks/123/reposts']}>
        <RepostsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('john')).toBeInTheDocument();
  });
});