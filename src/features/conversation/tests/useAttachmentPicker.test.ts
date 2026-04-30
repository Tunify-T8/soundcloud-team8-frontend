import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAttachmentPicker } from '../hooks/useAttachmentPicker';
import { api } from '@/features/auth/services/api';

// Mock the api
vi.mock('@/features/auth/services/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

const mockedApiGet = vi.mocked(api.get);

describe('useAttachmentPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state when not open', () => {
    const { result } = renderHook(() => useAttachmentPicker(false));

    expect(result.current.uploadedTracks).toEqual([]);
    expect(result.current.likedTracks).toEqual([]);
    expect(result.current.collections).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should fetch data when opened', async () => {
    const mockUploads = [
      { id: 'track-1', title: 'Track 1', coverUrl: 'cover1.jpg' },
    ];
    const mockLikes = [
      { id: 'like-1', title: 'Liked Track', coverUrl: 'cover2.jpg' },
    ];
    const mockCollections = [
      { id: 'col-1', title: 'Playlist 1', type: 'PLAYLIST', coverUrl: 'cover3.jpg' },
    ];

    mockedApiGet
      .mockResolvedValueOnce({ data: mockUploads }) // /tracks/me
      .mockResolvedValueOnce({ data: mockLikes }) // /users/me/liked-tracks
      .mockResolvedValueOnce({ data: mockCollections }); // /collections/me

    const { result } = renderHook(() => useAttachmentPicker(true));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedApiGet).toHaveBeenCalledTimes(3);
    expect(mockedApiGet).toHaveBeenNthCalledWith(1, '/tracks/me');
    expect(mockedApiGet).toHaveBeenNthCalledWith(2, '/users/me/liked-tracks');
    expect(mockedApiGet).toHaveBeenNthCalledWith(3, '/collections/me');

    expect(result.current.uploadedTracks).toEqual([
      {
        id: 'track-1',
        title: 'Track 1',
        coverUrl: 'cover1.jpg',
        type: 'TRACK_UPLOAD',
      },
    ]);

    expect(result.current.likedTracks).toEqual([
      {
        id: 'like-1',
        title: 'Liked Track',
        coverUrl: 'cover2.jpg',
        type: 'TRACK_LIKE',
      },
    ]);

    expect(result.current.collections).toEqual([
      {
        id: 'col-1',
        title: 'Playlist 1',
        coverUrl: 'cover3.jpg',
        type: 'PLAYLIST',
      },
    ]);
  });

  it('should handle API errors gracefully', async () => {
    mockedApiGet
      .mockRejectedValueOnce(new Error('Uploads failed'))
      .mockRejectedValueOnce(new Error('Likes failed'))
      .mockRejectedValueOnce(new Error('Collections failed'));

    const { result } = renderHook(() => useAttachmentPicker(true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load your tracks and playlists.');
    expect(result.current.uploadedTracks).toEqual([]);
    expect(result.current.likedTracks).toEqual([]);
    expect(result.current.collections).toEqual([]);
  });

  it('should handle partial API failures', async () => {
    const mockUploads = [{ id: 'track-1', title: 'Track 1' }];
    const mockCollections = [{ id: 'col-1', title: 'Playlist 1', type: 'ALBUM' }];

    mockedApiGet
      .mockResolvedValueOnce({ data: mockUploads })
      .mockRejectedValueOnce(new Error('Likes failed'))
      .mockResolvedValueOnce({ data: mockCollections });

    const { result } = renderHook(() => useAttachmentPicker(true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.uploadedTracks).toHaveLength(1);
    expect(result.current.likedTracks).toEqual([]);
    expect(result.current.collections).toEqual([
      {
        id: 'col-1',
        title: 'Playlist 1',
        coverUrl: null,
        type: 'ALBUM',
      },
    ]);
  });

  it('should handle different response formats for uploads', async () => {
    const mockUploads = {
      tracks: [
        { id: 'track-1', name: 'Track Name', artwork: 'artwork.jpg' },
      ],
    };

    mockedApiGet
      .mockResolvedValueOnce({ data: mockUploads })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    const { result } = renderHook(() => useAttachmentPicker(true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.uploadedTracks).toEqual([
      {
        id: 'track-1',
        title: 'Track Name',
        coverUrl: 'artwork.jpg',
        type: 'TRACK_UPLOAD',
      },
    ]);
  });

  it('should handle different response formats for liked tracks', async () => {
    const mockLikes = {
      data: [
        {
          trackId: 'track-1',
          track: { title: 'Track Title', coverUrl: 'cover.jpg' },
        },
      ],
    };

    mockedApiGet
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: mockLikes })
      .mockResolvedValueOnce({ data: [] });

    const { result } = renderHook(() => useAttachmentPicker(true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.likedTracks).toEqual([
      {
        id: 'track-1',
        title: 'Track Title',
        coverUrl: 'cover.jpg',
        type: 'TRACK_LIKE',
      },
    ]);
  });

  it('should handle different response formats for collections', async () => {
    const mockCollections = {
      collections: [
        { id: 'col-1', name: 'Collection Name', artworkUrl: 'art.jpg', type: 'ALBUM' },
      ],
    };

    mockedApiGet
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: mockCollections });

    const { result } = renderHook(() => useAttachmentPicker(true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.collections).toEqual([
      {
        id: 'col-1',
        title: 'Collection Name',
        coverUrl: 'art.jpg',
        type: 'ALBUM',
      },
    ]);
  });

  it('should use fallback values for missing fields', async () => {
    const mockUploads = [{ id: 'track-1' }];
    const mockLikes = [{ id: 'like-1' }];
    const mockCollections = [{ id: 'col-1' }];

    mockedApiGet
      .mockResolvedValueOnce({ data: mockUploads })
      .mockResolvedValueOnce({ data: mockLikes })
      .mockResolvedValueOnce({ data: mockCollections });

    const { result } = renderHook(() => useAttachmentPicker(true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.uploadedTracks[0]).toEqual({
      id: 'track-1',
      title: 'Untitled',
      coverUrl: null,
      type: 'TRACK_UPLOAD',
    });

    expect(result.current.likedTracks[0]).toEqual({
      id: 'like-1',
      title: 'Untitled',
      coverUrl: null,
      type: 'TRACK_LIKE',
    });

    expect(result.current.collections[0]).toEqual({
      id: 'col-1',
      title: 'Untitled',
      coverUrl: null,
      type: 'PLAYLIST',
    });
  });

  it('should not fetch when not open', () => {
    const { result } = renderHook(() => useAttachmentPicker(false));

    expect(mockedApiGet).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('should refetch when reopened', async () => {
    mockedApiGet
      .mockResolvedValue({ data: [] })
      .mockResolvedValue({ data: [] })
      .mockResolvedValue({ data: [] });

    const { rerender } = renderHook(
      (isOpen) => useAttachmentPicker(isOpen),
      { initialProps: false }
    );

    expect(mockedApiGet).not.toHaveBeenCalled();

    rerender(true);

    await waitFor(() => {
      expect(mockedApiGet).toHaveBeenCalledTimes(3);
    });

    rerender(false);
    rerender(true);

    await waitFor(() => {
      expect(mockedApiGet).toHaveBeenCalledTimes(6);
    });
  });
});