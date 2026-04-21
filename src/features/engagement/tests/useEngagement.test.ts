import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
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

const TRACK_ID = 'some-track-uuid';



const baseEngagement = {
  trackId: TRACK_ID,
  likesCount: 5,
  repostsCount: 2,
  commentsCount: 8,
  isLiked: false,
  isReposted: false,
  isSaved: false,
};

const likedEngagement = { ...baseEngagement, isLiked: true };
const repostedEngagement = { ...baseEngagement, isReposted: true };



beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(engagementService.getEngagement).mockResolvedValue(baseEngagement);
});

describe('useEngagement', () => {

  

  describe('initial state', () => {
    it('starts with loading true', () => {
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      expect(result.current.loading).toBe(true);
    });

    it('starts with isLiked false', () => {
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      expect(result.current.isLiked).toBe(false);
    });

    it('starts with isReposted false', () => {
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      expect(result.current.isReposted).toBe(false);
    });

    it('starts with zero counts', () => {
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      expect(result.current.counts.likes).toBe(0);
      expect(result.current.counts.reposts).toBe(0);
      expect(result.current.counts.comments).toBe(0);
    });
  });



  describe('after data loads', () => {
    it('sets loading to false after successful fetch', async () => {
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('populates counts from getEngagement response', async () => {
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.counts.likes).toBe(5);
      expect(result.current.counts.reposts).toBe(2);
      expect(result.current.counts.comments).toBe(8);
    });

    it('sets isLiked false when API returns isLiked: false', async () => {
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.isLiked).toBe(false);
    });

    it('sets isLiked true when API returns isLiked: true', async () => {
      vi.mocked(engagementService.getEngagement).mockResolvedValue(likedEngagement);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.isLiked).toBe(true);
    });

    it('sets isReposted true when API returns isReposted: true', async () => {
      vi.mocked(engagementService.getEngagement).mockResolvedValue(repostedEngagement);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.isReposted).toBe(true);
    });

    it('calls getEngagement with the correct trackId', async () => {
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(engagementService.getEngagement).toHaveBeenCalledWith(TRACK_ID);
    });

    it('handles fetch error gracefully — sets loading false and keeps zero counts', async () => {
      vi.mocked(engagementService.getEngagement).mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.counts.likes).toBe(0);
      expect(result.current.counts.reposts).toBe(0);
    });

    it('does not fetch when trackId is empty string', async () => {
      renderHook(() => useEngagement(''));
      await new Promise((r) => setTimeout(r, 50));
      expect(engagementService.getEngagement).not.toHaveBeenCalled();
    });
  });



  describe('toggleLike', () => {
    it('calls likeTrack with trackId when not liked', async () => {
      vi.mocked(engagementService.likeTrack).mockResolvedValue(undefined);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.toggleLike(); });

      expect(engagementService.likeTrack).toHaveBeenCalledWith(TRACK_ID);
    });

    it('sets isLiked to true after liking', async () => {
      vi.mocked(engagementService.likeTrack).mockResolvedValue(undefined);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.toggleLike(); });

      expect(result.current.isLiked).toBe(true);
    });

    it('increments likes count when liking', async () => {
      vi.mocked(engagementService.likeTrack).mockResolvedValue(undefined);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      const before = result.current.counts.likes;

      await act(async () => { await result.current.toggleLike(); });

      expect(result.current.counts.likes).toBe(before + 1);
    });

    it('calls unlikeTrack with trackId when already liked', async () => {
      vi.mocked(engagementService.getEngagement).mockResolvedValue(likedEngagement);
      vi.mocked(engagementService.unlikeTrack).mockResolvedValue(undefined);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.isLiked).toBe(true);

      await act(async () => { await result.current.toggleLike(); });

      expect(engagementService.unlikeTrack).toHaveBeenCalledWith(TRACK_ID);
    });

    it('sets isLiked to false after unliking', async () => {
      vi.mocked(engagementService.getEngagement).mockResolvedValue(likedEngagement);
      vi.mocked(engagementService.unlikeTrack).mockResolvedValue(undefined);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.toggleLike(); });

      expect(result.current.isLiked).toBe(false);
    });

    it('decrements likes count when unliking', async () => {
      vi.mocked(engagementService.getEngagement).mockResolvedValue(likedEngagement);
      vi.mocked(engagementService.unlikeTrack).mockResolvedValue(undefined);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      const before = result.current.counts.likes;

      await act(async () => { await result.current.toggleLike(); });

      expect(result.current.counts.likes).toBe(Math.max(0, before - 1));
    });

    it('does not let likes count go below 0', async () => {
      vi.mocked(engagementService.getEngagement).mockResolvedValue({
        ...likedEngagement,
        likesCount: 0,
      });
      vi.mocked(engagementService.unlikeTrack).mockResolvedValue(undefined);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.toggleLike(); });

      expect(result.current.counts.likes).toBe(0);
    });
  });

  

  describe('toggleRepost', () => {
    it('calls repostTrack with trackId when not reposted', async () => {
      vi.mocked(engagementService.repostTrack).mockResolvedValue(undefined);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.toggleRepost(); });

      expect(engagementService.repostTrack).toHaveBeenCalledWith(TRACK_ID);
    });

    it('sets isReposted to true after reposting', async () => {
      vi.mocked(engagementService.repostTrack).mockResolvedValue(undefined);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.toggleRepost(); });

      expect(result.current.isReposted).toBe(true);
    });

    it('increments reposts count when reposting', async () => {
      vi.mocked(engagementService.repostTrack).mockResolvedValue(undefined);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      const before = result.current.counts.reposts;

      await act(async () => { await result.current.toggleRepost(); });

      expect(result.current.counts.reposts).toBe(before + 1);
    });

    it('calls unrepostTrack with trackId when already reposted', async () => {
      vi.mocked(engagementService.getEngagement).mockResolvedValue(repostedEngagement);
      vi.mocked(engagementService.unrepostTrack).mockResolvedValue(undefined);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.isReposted).toBe(true);

      await act(async () => { await result.current.toggleRepost(); });

      expect(engagementService.unrepostTrack).toHaveBeenCalledWith(TRACK_ID);
    });

    it('sets isReposted to false after unreposting', async () => {
      vi.mocked(engagementService.getEngagement).mockResolvedValue(repostedEngagement);
      vi.mocked(engagementService.unrepostTrack).mockResolvedValue(undefined);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.toggleRepost(); });

      expect(result.current.isReposted).toBe(false);
    });

    it('decrements reposts count when unreposting', async () => {
      vi.mocked(engagementService.getEngagement).mockResolvedValue(repostedEngagement);
      vi.mocked(engagementService.unrepostTrack).mockResolvedValue(undefined);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      const before = result.current.counts.reposts;

      await act(async () => { await result.current.toggleRepost(); });

      expect(result.current.counts.reposts).toBe(Math.max(0, before - 1));
    });

    it('does not let reposts count go below 0', async () => {
      vi.mocked(engagementService.getEngagement).mockResolvedValue({
        ...repostedEngagement,
        repostsCount: 0,
      });
      vi.mocked(engagementService.unrepostTrack).mockResolvedValue(undefined);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.toggleRepost(); });

      expect(result.current.counts.reposts).toBe(0);
    });
  });
});
