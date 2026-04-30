// src/features/engagement/tests/TrackPage.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// ✅ Path must match exactly what TrackPage.tsx imports
vi.mock('@/features/engagement/services/engagementService', () => ({
  engagementService: {
    getTrackDetails: vi.fn(),
    getTrackComments: vi.fn(),
    getEngagement: vi.fn().mockResolvedValue({
      likes: 0, reposts: 0, comments: 0, plays: 0,
    }),
  },
}));

vi.mock('@/features/playerUI/context/usePlayer', () => ({
  usePlayer: () => ({
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    setCurrentTrack: vi.fn(),
    setIsPlaying: vi.fn(),
    requestSeek: vi.fn(),
  }),
}));

vi.mock('@/features/engagement/hooks/useEngagement', () => ({
  useEngagement: () => ({
    counts: { likes: 0, reposts: 0, plays: 0, comments: 0 },
    isLiked: false,
    isReposted: false,
    loading: false,
    toggleLike: vi.fn(),
    toggleRepost: vi.fn(),
  }),
}));

// ✅ Also mock the api used for artist follow status
vi.mock('@/features/auth/services/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: { isFollowing: false, followersCount: 0 } }),
    post: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
}));

// ✅ Import AFTER all vi.mock calls
import TrackPage from '../pages/TrackPage';
import { engagementService } from '@/features/engagement/services/engagementService';

describe('TrackPage', () => {
  it('renders track', async () => {
    (engagementService.getTrackDetails as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: '1',
      title: 'test',
      artists: [{ id: 'a1', name: 'artist' }],
      durationSeconds: 120,
      createdAt: '',
      plays: 0,
      artworkUrl: '',
      audioUrl: '',
    });

    (engagementService.getTrackComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      comments: [],
    });

    render(
      <MemoryRouter initialEntries={['/tracks/1']}>
        <Routes>
          <Route path="/tracks/:trackId" element={<TrackPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('test')).toBeInTheDocument();
  });
});