import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useEngagement } from '../hooks/useEngagement';
import { engagementService } from '../services/engagementService';

vi.mock('../services/engagementService', () => ({
  engagementService: {
    getEngagementCounts: vi.fn(),
    getTrackLikes: vi.fn(),
    getTrackReposts: vi.fn(),
    likeTrack: vi.fn(),
    unlikeTrack: vi.fn(),
    repostTrack: vi.fn(),
    unrepostTrack: vi.fn(),
  },
}));

const TRACK_ID = 'dj-sunshine/summer-vibes';
const CURRENT_USER = 'user1';

const mockCounts = { likes: 2, reposts: 1, plays: 100, comments: 5 };

const mockLikes = [
  { id: 'like1', userId: 'user3', trackId: TRACK_ID, createdAt: '', user: { id: 'user3', username: 'fan', avatarUrl: '' } },
];

const mockReposts = [
  { id: 'repost1', userId: 'user5', trackId: TRACK_ID, createdAt: '', user: { id: 'user5', username: 'sharer', avatarUrl: '' } },
];

const mockLikeForCurrentUser = [
  { id: 'like_user1', userId: CURRENT_USER, trackId: TRACK_ID, createdAt: '', user: { id: CURRENT_USER, username: 'me', avatarUrl: '' } },
];

const mockRepostForCurrentUser = [
  { id: 'repost_user1', userId: CURRENT_USER, trackId: TRACK_ID, createdAt: '', user: { id: CURRENT_USER, username: 'me', avatarUrl: '' } },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(engagementService.getEngagementCounts).mockResolvedValue(mockCounts);
  vi.mocked(engagementService.getTrackLikes).mockResolvedValue(mockLikes);
  vi.mocked(engagementService.getTrackReposts).mockResolvedValue(mockReposts);
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
    });
  });

  describe('after data loads', () => {
    it('sets loading to false after fetch', async () => {
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('sets correct counts from API', async () => {
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.counts.likes).toBe(2);
      expect(result.current.counts.reposts).toBe(1);
    });

    it('sets isLiked false when current user has not liked', async () => {
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.isLiked).toBe(false);
    });

    it('sets isLiked true when current user has liked', async () => {
      vi.mocked(engagementService.getTrackLikes).mockResolvedValue(mockLikeForCurrentUser);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.isLiked).toBe(true);
    });

    it('sets isReposted true when current user has reposted', async () => {
      vi.mocked(engagementService.getTrackReposts).mockResolvedValue(mockRepostForCurrentUser);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.isReposted).toBe(true);
    });

    it('handles fetch error gracefully and sets loading false', async () => {
      vi.mocked(engagementService.getEngagementCounts).mockRejectedValue(new Error('fail'));
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.counts.likes).toBe(0);
    });
  });

  describe('toggleLike', () => {
    it('calls likeTrack and sets isLiked true when not liked', async () => {
      vi.mocked(engagementService.likeTrack).mockResolvedValue({
        id: 'like_new', userId: CURRENT_USER, trackId: TRACK_ID, createdAt: '',
        user: { id: CURRENT_USER, username: 'me', avatarUrl: '' },
      });
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      await act(async () => { await result.current.toggleLike(); });
      expect(engagementService.likeTrack).toHaveBeenCalledWith(CURRENT_USER, TRACK_ID);
      expect(result.current.isLiked).toBe(true);
    });

    it('increments like count when liking', async () => {
      vi.mocked(engagementService.likeTrack).mockResolvedValue({
        id: 'like_new', userId: CURRENT_USER, trackId: TRACK_ID, createdAt: '',
        user: { id: CURRENT_USER, username: 'me', avatarUrl: '' },
      });
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      const before = result.current.counts.likes;
      await act(async () => { await result.current.toggleLike(); });
      expect(result.current.counts.likes).toBe(before + 1);
    });

    it('calls unlikeTrack and sets isLiked false when already liked', async () => {
      vi.mocked(engagementService.getTrackLikes).mockResolvedValue(mockLikeForCurrentUser);
      vi.mocked(engagementService.unlikeTrack).mockResolvedValue(undefined);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.isLiked).toBe(true);
      await act(async () => { await result.current.toggleLike(); });
      expect(engagementService.unlikeTrack).toHaveBeenCalled();
      expect(result.current.isLiked).toBe(false);
    });

    it('decrements like count when unliking', async () => {
      vi.mocked(engagementService.getTrackLikes).mockResolvedValue(mockLikeForCurrentUser);
      vi.mocked(engagementService.unlikeTrack).mockResolvedValue(undefined);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      const before = result.current.counts.likes;
      await act(async () => { await result.current.toggleLike(); });
      expect(result.current.counts.likes).toBe(Math.max(0, before - 1));
    });

    it('does not go below 0 likes', async () => {
      vi.mocked(engagementService.getEngagementCounts).mockResolvedValue({ ...mockCounts, likes: 0 });
      vi.mocked(engagementService.getTrackLikes).mockResolvedValue(mockLikeForCurrentUser);
      vi.mocked(engagementService.unlikeTrack).mockResolvedValue(undefined);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      await act(async () => { await result.current.toggleLike(); });
      expect(result.current.counts.likes).toBe(0);
    });
  });

  describe('toggleRepost', () => {
    it('calls repostTrack and sets isReposted true when not reposted', async () => {
      vi.mocked(engagementService.repostTrack).mockResolvedValue({
        id: 'repost_new', userId: CURRENT_USER, trackId: TRACK_ID, createdAt: '',
        user: { id: CURRENT_USER, username: 'me', avatarUrl: '' },
      });
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      await act(async () => { await result.current.toggleRepost(); });
      expect(engagementService.repostTrack).toHaveBeenCalledWith(CURRENT_USER, TRACK_ID);
      expect(result.current.isReposted).toBe(true);
    });

    it('increments repost count when reposting', async () => {
      vi.mocked(engagementService.repostTrack).mockResolvedValue({
        id: 'repost_new', userId: CURRENT_USER, trackId: TRACK_ID, createdAt: '',
        user: { id: CURRENT_USER, username: 'me', avatarUrl: '' },
      });
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      const before = result.current.counts.reposts;
      await act(async () => { await result.current.toggleRepost(); });
      expect(result.current.counts.reposts).toBe(before + 1);
    });

    it('calls unrepostTrack and sets isReposted false when already reposted', async () => {
      vi.mocked(engagementService.getTrackReposts).mockResolvedValue(mockRepostForCurrentUser);
      vi.mocked(engagementService.unrepostTrack).mockResolvedValue(undefined);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.isReposted).toBe(true);
      await act(async () => { await result.current.toggleRepost(); });
      expect(engagementService.unrepostTrack).toHaveBeenCalled();
      expect(result.current.isReposted).toBe(false);
    });

    it('decrements repost count when unreposting', async () => {
      vi.mocked(engagementService.getTrackReposts).mockResolvedValue(mockRepostForCurrentUser);
      vi.mocked(engagementService.unrepostTrack).mockResolvedValue(undefined);
      const { result } = renderHook(() => useEngagement(TRACK_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      const before = result.current.counts.reposts;
      await act(async () => { await result.current.toggleRepost(); });
      expect(result.current.counts.reposts).toBe(Math.max(0, before - 1));
    });
  });
});