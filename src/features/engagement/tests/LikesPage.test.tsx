// src/features/conversation/pages/__tests__/LikesPage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LikesPage from '../pages/LikesPage';
import { engagementService } from '../services/engagementService';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../services/engagementService', () => ({
  engagementService: {
    getTrackLikes: vi.fn(),
  },
}));

describe('LikesPage', () => {
  it('renders likes', async () => {
    (engagementService.getTrackLikes as any).mockResolvedValue({
      likes: [
        {
          user: {
            id: '1',
            username: 'john',
            avatarUrl: null,
          },
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={['/tracks/1/likes']}>
        <Routes>
          <Route path="/tracks/:trackId/likes" element={<LikesPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('john')).toBeInTheDocument();
  });
});