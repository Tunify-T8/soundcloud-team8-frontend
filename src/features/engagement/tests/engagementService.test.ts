// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { engagementService } from '../services/engagementService';
// import { api } from "@/features/auth/services/api";

// vi.mock('../../../services/api', () => ({
//   api: {
//     get: vi.fn(),
//     post: vi.fn(),
//     delete: vi.fn(),
//   },
// }));

// const mockApi = api as unknown as {
//   get: ReturnType<typeof vi.fn>;
//   post: ReturnType<typeof vi.fn>;
//   delete: ReturnType<typeof vi.fn>;
// };

// const TRACK_ID = 'dj-sunshine/summer-vibes';

// const mockLike = {
//   id: 'like1',
//   userId: 'user1',
//   trackId: TRACK_ID,
//   createdAt: '2024-01-01T00:00:00Z',
//   user: { id: 'user1', username: 'testuser', avatarUrl: '' },
// };

// const mockRepost = {
//   id: 'repost1',
//   userId: 'user1',
//   trackId: TRACK_ID,
//   createdAt: '2024-01-01T00:00:00Z',
//   user: { id: 'user1', username: 'testuser', avatarUrl: '' },
// };

// const mockCounts = { likes: 5, reposts: 2, plays: 100, comments: 10 };

// const mockTrack = {
//   id: TRACK_ID,
//   title: 'Summer Vibes',
//   artist: 'DJ Sunshine',
//   artistId: 'user1',
//   duration: 180,
//   genre: 'Electronic',
//   artworkUrl: '',
//   audioUrl: '',
//   createdAt: '2024-01-01T00:00:00Z',
//   updatedAt: '2024-01-01T00:00:00Z',
//   plays: 100,
//   likes: 5,
//   reposts: 2,
// };

// beforeEach(() => {
//   vi.clearAllMocks();
// });

// describe('engagementService', () => {

//   describe('getTrackDetails', () => {
//     it('calls correct URL and returns track data', async () => {
//       mockApi.get.mockResolvedValueOnce({ data: mockTrack });
//       const result = await engagementService.getTrackDetails(TRACK_ID);
//       expect(mockApi.get).toHaveBeenCalledWith(`/${TRACK_ID}`);
//       expect(result).toEqual(mockTrack);
//     });

//     it('throws when API fails', async () => {
//       mockApi.get.mockRejectedValueOnce(new Error('Network error'));
//       await expect(engagementService.getTrackDetails(TRACK_ID)).rejects.toThrow('Network error');
//     });
//   });

//   describe('getTrackLikes', () => {
//     it('calls correct URL and returns likes array', async () => {
//       mockApi.get.mockResolvedValueOnce({ data: [mockLike] });
//       const result = await engagementService.getTrackLikes(TRACK_ID);
//       expect(mockApi.get).toHaveBeenCalledWith(`/${TRACK_ID}/likes`);
//       expect(result).toEqual([mockLike]);
//     });

//     it('returns empty array when no likes', async () => {
//       mockApi.get.mockResolvedValueOnce({ data: [] });
//       const result = await engagementService.getTrackLikes(TRACK_ID);
//       expect(result).toEqual([]);
//     });

//     it('throws when API fails', async () => {
//       mockApi.get.mockRejectedValueOnce(new Error('Not found'));
//       await expect(engagementService.getTrackLikes(TRACK_ID)).rejects.toThrow('Not found');
//     });
//   });

//   describe('likeTrack', () => {
//     it('posts to correct URL with userId and returns like', async () => {
//       mockApi.post.mockResolvedValueOnce({ data: mockLike });
//       const result = await engagementService.likeTrack('user1', TRACK_ID);
//       expect(mockApi.post).toHaveBeenCalledWith(`/${TRACK_ID}/likes`, { userId: 'user1' });
//       expect(result).toEqual(mockLike);
//     });

//     it('throws when API fails', async () => {
//       mockApi.post.mockRejectedValueOnce(new Error('Unauthorized'));
//       await expect(engagementService.likeTrack('user1', TRACK_ID)).rejects.toThrow('Unauthorized');
//     });
//   });

//   describe('unlikeTrack', () => {
//     it('deletes correct URL', async () => {
//       mockApi.delete.mockResolvedValueOnce({ data: null });
//       await engagementService.unlikeTrack('like1', TRACK_ID);
//       expect(mockApi.delete).toHaveBeenCalledWith(`/${TRACK_ID}/likes/like1`);
//     });

//     it('throws when API fails', async () => {
//       mockApi.delete.mockRejectedValueOnce(new Error('Not found'));
//       await expect(engagementService.unlikeTrack('like1', TRACK_ID)).rejects.toThrow('Not found');
//     });
//   });

//   describe('getTrackReposts', () => {
//     it('calls correct URL and returns reposts array', async () => {
//       mockApi.get.mockResolvedValueOnce({ data: [mockRepost] });
//       const result = await engagementService.getTrackReposts(TRACK_ID);
//       expect(mockApi.get).toHaveBeenCalledWith(`/${TRACK_ID}/reposts`);
//       expect(result).toEqual([mockRepost]);
//     });

//     it('returns empty array when no reposts', async () => {
//       mockApi.get.mockResolvedValueOnce({ data: [] });
//       const result = await engagementService.getTrackReposts(TRACK_ID);
//       expect(result).toEqual([]);
//     });

//     it('throws when API fails', async () => {
//       mockApi.get.mockRejectedValueOnce(new Error('Server error'));
//       await expect(engagementService.getTrackReposts(TRACK_ID)).rejects.toThrow('Server error');
//     });
//   });

//   describe('repostTrack', () => {
//     it('posts to correct URL with userId and returns repost', async () => {
//       mockApi.post.mockResolvedValueOnce({ data: mockRepost });
//       const result = await engagementService.repostTrack('user1', TRACK_ID);
//       expect(mockApi.post).toHaveBeenCalledWith(`/${TRACK_ID}/reposts`, { userId: 'user1' });
//       expect(result).toEqual(mockRepost);
//     });

//     it('throws when API fails', async () => {
//       mockApi.post.mockRejectedValueOnce(new Error('Unauthorized'));
//       await expect(engagementService.repostTrack('user1', TRACK_ID)).rejects.toThrow('Unauthorized');
//     });
//   });

//   describe('unrepostTrack', () => {
//     it('deletes correct URL', async () => {
//       mockApi.delete.mockResolvedValueOnce({ data: null });
//       await engagementService.unrepostTrack('repost1', TRACK_ID);
//       expect(mockApi.delete).toHaveBeenCalledWith(`/${TRACK_ID}/reposts/repost1`);
//     });

//     it('throws when API fails', async () => {
//       mockApi.delete.mockRejectedValueOnce(new Error('Not found'));
//       await expect(engagementService.unrepostTrack('repost1', TRACK_ID)).rejects.toThrow('Not found');
//     });
//   });

//   describe('getEngagementCounts', () => {
//     it('calls correct URL and returns counts', async () => {
//       mockApi.get.mockResolvedValueOnce({ data: mockCounts });
//       const result = await engagementService.getEngagementCounts(TRACK_ID);
//       expect(mockApi.get).toHaveBeenCalledWith(`/${TRACK_ID}/engagement`);
//       expect(result).toEqual(mockCounts);
//     });

//     it('returns correct shape with all count fields', async () => {
//       mockApi.get.mockResolvedValueOnce({ data: mockCounts });
//       const result = await engagementService.getEngagementCounts(TRACK_ID);
//       expect(result).toHaveProperty('likes');
//       expect(result).toHaveProperty('reposts');
//       expect(result).toHaveProperty('plays');
//       expect(result).toHaveProperty('comments');
//     });

//     it('throws when API fails', async () => {
//       mockApi.get.mockRejectedValueOnce(new Error('Server error'));
//       await expect(engagementService.getEngagementCounts(TRACK_ID)).rejects.toThrow('Server error');
//     });
//   });
// });