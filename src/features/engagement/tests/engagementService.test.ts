import { describe, it, expect, vi, beforeEach } from 'vitest';
import { engagementService } from '../services/engagementService';
import { api } from '../../auth/services/api';

vi.mock('../../auth/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const TRACK_ID = 'some-track-uuid';
const COMMENT_ID = 'some-comment-uuid';



const mockTrack = {
  id: TRACK_ID,
  title: 'Summer Vibes',
  artist: 'DJ Sunshine',
  genre: 'Electronic',
  tags: [],
  status: 'finished',
  visibility: 'public',
  audioUrl: 'https://example.com/audio.mp3',
  description: '',
  duration: 180,
  date: '2024-01-01T00:00:00Z',
  likes: 5,
  comments: 10,
  reposts: 2,
  downloads: null,
  plays: 100,
};

const mockEngagement = {
  trackId: TRACK_ID,
  likesCount: 10,
  commentsCount: 5,
  repostsCount: 3,
  isLiked: true,
  isReposted: false,
  isSaved: false,
};

const mockPaginatedLikes = {
  likes: [
    { userId: 'u1', username: 'alice', displayName: 'Alice', avatarUrl: null, isCertified: false },
  ],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

const mockPaginatedReposts = {
  reposts: [
    {
      repostId: 'r1',
      userId: 'u2',
      username: 'bob',
      displayName: 'Bob',
      avatarUrl: null,
      isCertified: false,
      repostedAt: '2024-01-01T00:00:00Z',
    },
  ],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

const mockPaginatedComments = {
  comments: [
    {
      commentId: COMMENT_ID,
      trackId: TRACK_ID,
      text: 'Great track!',
      timestamp: 18,
      likesCount: 2,
      repliesCount: 1,
      isLiked: false,
      createdAt: '2024-01-01T00:00:00Z',
      user: { userId: 'u1', username: 'alice', avatarUrl: null },
    },
  ],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

const mockPaginatedReplies = {
  replies: [
    {
      replyId: 'rep1',
      parentId: COMMENT_ID,
      parentUsername: 'alice',
      text: 'Thanks!',
      likesCount: 0,
      isLiked: false,
      createdAt: '2024-01-01T00:00:00Z',
      user: { userId: 'u2', username: 'bob', avatarUrl: null },
    },
  ],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};



beforeEach(() => {
  vi.clearAllMocks();
});

describe('engagementService', () => {

  

  describe('getTrackDetails', () => {
    it('calls GET /tracks/:trackId and returns track data', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockTrack });
      const result = await engagementService.getTrackDetails(TRACK_ID);
      expect(mockApi.get).toHaveBeenCalledWith(`/tracks/${TRACK_ID}`);
      expect(result).toEqual(mockTrack);
    });

    it('throws when API fails', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'));
      await expect(engagementService.getTrackDetails(TRACK_ID)).rejects.toThrow('Network error');
    });
  });

  

  describe('getEngagement', () => {
    it('calls GET /tracks/:trackId/engagement and returns engagement data', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockEngagement });
      const result = await engagementService.getEngagement(TRACK_ID);
      expect(mockApi.get).toHaveBeenCalledWith(`/tracks/${TRACK_ID}/engagement`);
      expect(result).toEqual(mockEngagement);
    });

    it('response contains all required fields', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockEngagement });
      const result = await engagementService.getEngagement(TRACK_ID);
      expect(result).toHaveProperty('likesCount');
      expect(result).toHaveProperty('commentsCount');
      expect(result).toHaveProperty('repostsCount');
      expect(result).toHaveProperty('isLiked');
      expect(result).toHaveProperty('isReposted');
      expect(result).toHaveProperty('isSaved');
    });

    it('throws when API fails', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Server error'));
      await expect(engagementService.getEngagement(TRACK_ID)).rejects.toThrow('Server error');
    });
  });

  
  describe('likeTrack', () => {
    it('calls POST /tracks/:trackId/like with only trackId', async () => {
      mockApi.post.mockResolvedValueOnce({ data: undefined });
      await engagementService.likeTrack(TRACK_ID);
      expect(mockApi.post).toHaveBeenCalledWith(`/tracks/${TRACK_ID}/like`);
    });

    it('throws when API fails', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Unauthorized'));
      await expect(engagementService.likeTrack(TRACK_ID)).rejects.toThrow('Unauthorized');
    });
  });

  

  describe('unlikeTrack', () => {
    it('calls DELETE /tracks/:trackId/like with only trackId', async () => {
      mockApi.delete.mockResolvedValueOnce({ data: undefined });
      await engagementService.unlikeTrack(TRACK_ID);
      expect(mockApi.delete).toHaveBeenCalledWith(`/tracks/${TRACK_ID}/like`);
    });

    it('throws when API fails', async () => {
      mockApi.delete.mockRejectedValueOnce(new Error('Not found'));
      await expect(engagementService.unlikeTrack(TRACK_ID)).rejects.toThrow('Not found');
    });
  });

  

  describe('repostTrack', () => {
    it('calls POST /tracks/:trackId/repost with only trackId', async () => {
      mockApi.post.mockResolvedValueOnce({ data: undefined });
      await engagementService.repostTrack(TRACK_ID);
      expect(mockApi.post).toHaveBeenCalledWith(`/tracks/${TRACK_ID}/repost`);
    });

    it('throws when API fails', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Unauthorized'));
      await expect(engagementService.repostTrack(TRACK_ID)).rejects.toThrow('Unauthorized');
    });
  });

  

  describe('unrepostTrack', () => {
    it('calls DELETE /tracks/:trackId/repost with only trackId', async () => {
      mockApi.delete.mockResolvedValueOnce({ data: undefined });
      await engagementService.unrepostTrack(TRACK_ID);
      expect(mockApi.delete).toHaveBeenCalledWith(`/tracks/${TRACK_ID}/repost`);
    });

    it('throws when API fails', async () => {
      mockApi.delete.mockRejectedValueOnce(new Error('Not found'));
      await expect(engagementService.unrepostTrack(TRACK_ID)).rejects.toThrow('Not found');
    });
  });

  
  describe('getTrackLikes', () => {
    it('calls GET /tracks/:trackId/likes with default pagination', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockPaginatedLikes });
      const result = await engagementService.getTrackLikes(TRACK_ID);
      expect(mockApi.get).toHaveBeenCalledWith(`/tracks/${TRACK_ID}/likes?page=1&limit=20`);
      expect(result).toEqual(mockPaginatedLikes);
    });

    it('respects custom page and limit params', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockPaginatedLikes });
      await engagementService.getTrackLikes(TRACK_ID, 2, 10);
      expect(mockApi.get).toHaveBeenCalledWith(`/tracks/${TRACK_ID}/likes?page=2&limit=10`);
    });

    it('returns paginated shape with likes array', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockPaginatedLikes });
      const result = await engagementService.getTrackLikes(TRACK_ID);
      expect(result).toHaveProperty('likes');
      expect(Array.isArray(result.likes)).toBe(true);
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('hasNextPage');
    });

    it('throws when API fails', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Not found'));
      await expect(engagementService.getTrackLikes(TRACK_ID)).rejects.toThrow('Not found');
    });
  });

  

  describe('getTrackReposts', () => {
    it('calls GET /tracks/:trackId/reposts with default pagination', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockPaginatedReposts });
      const result = await engagementService.getTrackReposts(TRACK_ID);
      expect(mockApi.get).toHaveBeenCalledWith(`/tracks/${TRACK_ID}/reposts?page=1&limit=20`);
      expect(result).toEqual(mockPaginatedReposts);
    });

    it('respects custom page and limit params', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockPaginatedReposts });
      await engagementService.getTrackReposts(TRACK_ID, 3, 5);
      expect(mockApi.get).toHaveBeenCalledWith(`/tracks/${TRACK_ID}/reposts?page=3&limit=5`);
    });

    it('returns paginated shape with reposts array', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockPaginatedReposts });
      const result = await engagementService.getTrackReposts(TRACK_ID);
      expect(result).toHaveProperty('reposts');
      expect(Array.isArray(result.reposts)).toBe(true);
    });

    it('throws when API fails', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Server error'));
      await expect(engagementService.getTrackReposts(TRACK_ID)).rejects.toThrow('Server error');
    });
  });

  

  describe('getTrackComments', () => {
    it('calls GET /tracks/:trackId/comments with default pagination', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockPaginatedComments });
      const result = await engagementService.getTrackComments(TRACK_ID);
      expect(mockApi.get).toHaveBeenCalledWith(`/tracks/${TRACK_ID}/comments?page=1&limit=20`);
      expect(result).toEqual(mockPaginatedComments);
    });

    it('returns comments array with correct shape', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockPaginatedComments });
      const result = await engagementService.getTrackComments(TRACK_ID);
      const comment = result.comments[0];
      expect(comment).toHaveProperty('commentId');
      expect(comment).toHaveProperty('text');
      expect(comment).toHaveProperty('timestamp');
      expect(comment).toHaveProperty('isLiked');
      expect(comment).toHaveProperty('user');
    });

    it('throws when API fails', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Server error'));
      await expect(engagementService.getTrackComments(TRACK_ID)).rejects.toThrow('Server error');
    });
  });

  

  describe('postComment', () => {
    it('calls POST /tracks/:trackId/comments with text and timestamp', async () => {
      mockApi.post.mockResolvedValueOnce({ data: undefined });
      await engagementService.postComment(TRACK_ID, 'Nice!', 42);
      expect(mockApi.post).toHaveBeenCalledWith(
        `/tracks/${TRACK_ID}/comments`,
        { text: 'Nice!', timestamp: 42 }
      );
    });

    it('throws when API fails', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Unauthorized'));
      await expect(engagementService.postComment(TRACK_ID, 'Hi', 0)).rejects.toThrow('Unauthorized');
    });
  });



  describe('deleteComment', () => {
    it('calls DELETE /comments/:commentId', async () => {
      mockApi.delete.mockResolvedValueOnce({ data: undefined });
      await engagementService.deleteComment(COMMENT_ID);
      expect(mockApi.delete).toHaveBeenCalledWith(`/comments/${COMMENT_ID}`);
    });

    it('throws when API fails', async () => {
      mockApi.delete.mockRejectedValueOnce(new Error('Forbidden'));
      await expect(engagementService.deleteComment(COMMENT_ID)).rejects.toThrow('Forbidden');
    });
  });

  

  describe('likeComment', () => {
    it('calls POST /comments/:commentId/like', async () => {
      mockApi.post.mockResolvedValueOnce({ data: undefined });
      await engagementService.likeComment(COMMENT_ID);
      expect(mockApi.post).toHaveBeenCalledWith(`/comments/${COMMENT_ID}/like`);
    });
  });

  describe('unlikeComment', () => {
    it('calls DELETE /comments/:commentId/like', async () => {
      mockApi.delete.mockResolvedValueOnce({ data: undefined });
      await engagementService.unlikeComment(COMMENT_ID);
      expect(mockApi.delete).toHaveBeenCalledWith(`/comments/${COMMENT_ID}/like`);
    });
  });

  

  describe('getReplies', () => {
    it('calls GET /comments/:commentId/replies with default pagination', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockPaginatedReplies });
      const result = await engagementService.getReplies(COMMENT_ID);
      expect(mockApi.get).toHaveBeenCalledWith(`/comments/${COMMENT_ID}/replies?page=1&limit=20`);
      expect(result).toEqual(mockPaginatedReplies);
    });

    it('returns replies array with correct shape', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockPaginatedReplies });
      const result = await engagementService.getReplies(COMMENT_ID);
      const reply = result.replies[0];
      expect(reply).toHaveProperty('replyId');
      expect(reply).toHaveProperty('text');
      expect(reply).toHaveProperty('user');
    });

    it('throws when API fails', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Not found'));
      await expect(engagementService.getReplies(COMMENT_ID)).rejects.toThrow('Not found');
    });
  });

  

  describe('postReply', () => {
    it('calls POST /comments/:commentId/replies with text', async () => {
      mockApi.post.mockResolvedValueOnce({ data: undefined });
      await engagementService.postReply(COMMENT_ID, 'Great reply!');
      expect(mockApi.post).toHaveBeenCalledWith(
        `/comments/${COMMENT_ID}/replies`,
        { text: 'Great reply!' }
      );
    });

    it('throws when API fails', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Unauthorized'));
      await expect(engagementService.postReply(COMMENT_ID, 'Hi')).rejects.toThrow('Unauthorized');
    });
  });
});
