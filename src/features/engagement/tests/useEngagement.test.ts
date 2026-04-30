// src/features/conversation/hooks/__tests__/useEngagement.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useEngagement } from '../hooks/useEngagement';
import { engagementService } from '../services/engagementService';

vi.mock('../services/engagementService', () => ({
  engagementService: {
    getEngagement: vi.fn(),
    likeTrack: vi.fn(),
    unlikeTrack: vi.fn(),
    repostTrack: vi.fn(),
    unrepostTrack: vi.fn(),
  },
}));

describe('useEngagement', () => {
  it('loads engagement', async () => {
    (engagementService.getEngagement as any).mockResolvedValue({
      likesCount: 1,
      repostsCount: 2,
      commentsCount: 3,
      isLiked: false,
      isReposted: false,
    });

    const { result } = renderHook(() => useEngagement('1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.counts.likes).toBe(1);
  });

  it('toggles like', async () => {
    (engagementService.getEngagement as any).mockResolvedValue({
      likesCount: 0,
      repostsCount: 0,
      commentsCount: 0,
      isLiked: false,
      isReposted: false,
    });

    const { result } = renderHook(() => useEngagement('1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleLike();
    });

    expect(engagementService.likeTrack).toHaveBeenCalled();
  });
});