import { describe, it, expect, vi, beforeEach } from 'vitest';
import { conversationService } from '../conversationService';
import { api } from '@/features/auth/services/api';

vi.mock('@/features/auth/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApiGet = vi.mocked(api.get);
const mockedApiPost = vi.mocked(api.post);
const mockedApiDelete = vi.mocked(api.delete);

describe('conversationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getConversationsSummary', () => {
    it('should fetch and normalize conversations successfully', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              conversationId: 'conv-1',
              otherUser: {
                id: 'user-1',
                username: 'testuser',
                displayName: 'Test User',
                avatarUrl: 'avatar.jpg',
              },
              unreadCount: 2,
              lastMessagePreview: 'Hello',
              lastMessageAt: '2024-01-01T00:00:00Z',
              status: 'ACTIVE',
            },
          ],
        },
      };

      mockedApiGet.mockResolvedValue(mockResponse);

      const result = await conversationService.getConversationsSummary();

      expect(mockedApiGet).toHaveBeenCalledWith('/users/me/conversations', {
        params: { page: 1, limit: 20 },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        conversationId: 'conv-1',
        otherUser: {
          id: 'user-1',
          displayName: 'testuser',
          avatarUrl: 'avatar.jpg',
        },
        lastMessagePreview: 'Hello',
        lastMessageAt: '2024-01-01T00:00:00Z',
        unreadCount: 2,
        status: 'ACTIVE',
      });
    });

    it('should handle array response format', async () => {
      const mockResponse = {
        data: [
          {
            id: 'conv-1',
            user2Id: 'user-1',
            unreadCount: 1,
            status: 'ACTIVE',
          },
        ],
      };

      mockedApiGet.mockResolvedValue(mockResponse);

      const result = await conversationService.getConversationsSummary();

      expect(result).toHaveLength(1);
      expect(result[0].conversationId).toBe('conv-1');
      expect(result[0].otherUser.displayName).toBe('User user-');
    });

    it('should use custom page and limit', async () => {
      const mockResponse = { data: { items: [] } };
      mockedApiGet.mockResolvedValue(mockResponse);

      await conversationService.getConversationsSummary(2, 10);

      expect(mockedApiGet).toHaveBeenCalledWith('/users/me/conversations', {
        params: { page: 2, limit: 10 },
      });
    });

    it('should throw error on API failure', async () => {
      mockedApiGet.mockRejectedValue(new Error('API Error'));

      await expect(conversationService.getConversationsSummary()).rejects.toThrow('API Error');
    });
  });

  describe('createOrGetConversation', () => {
    it('should create a new conversation', async () => {
      const mockResponse = {
        data: {
          id: 'conv-123',
          user1Id: 'user-1',
          user2Id: 'user-2',
          status: 'ACTIVE',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      };

      mockedApiPost.mockResolvedValue(mockResponse);

      const result = await conversationService.createOrGetConversation('user-2');

      expect(mockedApiPost).toHaveBeenCalledWith('/users/me/conversations', { userId: 'user-2' });
      expect(result).toBe('conv-123');
    });

    it('should handle conversationId field', async () => {
      const mockResponse = {
        data: {
          conversationId: 'conv-456',
        },
      };

      mockedApiPost.mockResolvedValue(mockResponse);

      const result = await conversationService.createOrGetConversation('user-2');

      expect(result).toBe('conv-456');
    });

    it('should throw error when no ID returned', async () => {
      const mockResponse = { data: {} };
      mockedApiPost.mockResolvedValue(mockResponse);

      await expect(conversationService.createOrGetConversation('user-2')).rejects.toThrow(
        'Server did not return a conversation ID'
      );
    });
  });

  describe('getMessages', () => {
    it('should fetch and normalize messages', async () => {
      const mockResponse = {
        data: {
          messages: [
            {
              id: 'msg-1',
              conversationId: 'conv-1',
              senderId: 'user-1',
              sender: {
                id: 'user-1',
                username: 'testuser',
                avatarUrl: 'avatar.jpg',
              },
              type: 'TEXT',
              content: 'Hello world',
              read: false,
              createdAt: '2024-01-01T00:00:00Z',
              attachment: null,
            },
          ],
          hasNextPage: false,
          total: 1,
          totalPages: 1,
        },
      };

      mockedApiGet.mockResolvedValue(mockResponse);

      const result = await conversationService.getMessages('conv-1');

      expect(mockedApiGet).toHaveBeenCalledWith('/conversations/conv-1/messages', {
        params: { page: 1, limit: 20 },
      });
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toEqual({
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        sender: {
          id: 'user-1',
          displayName: 'testuser',
          avatarUrl: 'avatar.jpg',
        },
        type: 'TEXT',
        content: 'Hello world',
        read: false,
        createdAt: '2024-01-01T00:00:00Z',
        attachment: null,
      });
      expect(result.hasNextPage).toBe(false);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should handle data.data format', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 'msg-1',
              senderId: 'user-1',
              type: 'TEXT',
              text: 'Hello',
              read: true,
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
      };

      mockedApiGet.mockResolvedValue(mockResponse);

      const result = await conversationService.getMessages('conv-1');

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content).toBe('Hello');
    });

    it('should use custom page and limit', async () => {
      const mockResponse = { data: { messages: [] } };
      mockedApiGet.mockResolvedValue(mockResponse);

      await conversationService.getMessages('conv-1', 2, 10);

      expect(mockedApiGet).toHaveBeenCalledWith('/conversations/conv-1/messages', {
        params: { page: 2, limit: 10 },
      });
    });
  });

  describe('markConversationAsRead', () => {
    it('should mark conversation as read', async () => {
      mockedApiPost.mockResolvedValue({});

      await conversationService.markConversationAsRead('conv-1');

      expect(mockedApiPost).toHaveBeenCalledWith('/conversations/conv-1/read');
    });
  });

  describe('markConversationAsUnread', () => {
    it('should mark conversation as unread', async () => {
      mockedApiPost.mockResolvedValue({});

      await conversationService.markConversationAsUnread('conv-1');

      expect(mockedApiPost).toHaveBeenCalledWith('/conversations/conv-1/unread');
    });
  });

  describe('archiveConversation', () => {
    it('should archive conversation', async () => {
      mockedApiPost.mockResolvedValue({});

      await conversationService.archiveConversation('conv-1');

      expect(mockedApiPost).toHaveBeenCalledWith('/conversations/conv-1/archive');
    });
  });

  describe('deleteConversation', () => {
    it('should delete conversation', async () => {
      mockedApiDelete.mockResolvedValue({});

      await conversationService.deleteConversation('conv-1');

      expect(mockedApiDelete).toHaveBeenCalledWith('/conversations/conv-1');
    });
  });

  describe('blockUser', () => {
    it('should block user with default options', async () => {
      mockedApiPost.mockResolvedValue({});

      await conversationService.blockUser('conv-1');

      expect(mockedApiPost).toHaveBeenCalledWith('/conversations/conv-1/block', {
        removeComments: false,
        reportSpam: false,
      });
    });

    it('should block user with custom options', async () => {
      mockedApiPost.mockResolvedValue({});

      await conversationService.blockUser('conv-1', true, true);

      expect(mockedApiPost).toHaveBeenCalledWith('/conversations/conv-1/block', {
        removeComments: true,
        reportSpam: true,
      });
    });
  });

  describe('unblockUser', () => {
    it('should unblock user', async () => {
      mockedApiPost.mockResolvedValue({});

      await conversationService.unblockUser('user-1');

      expect(mockedApiPost).toHaveBeenCalledWith('/conversations/unblock/user-1');
    });
  });

  describe('getUnreadCount', () => {
    it('should get unread count', async () => {
      const mockResponse = { data: { unreadCount: 5 } };
      mockedApiGet.mockResolvedValue(mockResponse);

      const result = await conversationService.getUnreadCount();

      expect(mockedApiGet).toHaveBeenCalledWith('/me/messages/unread-count');
      expect(result).toBe(5);
    });

    it('should return 0 when no data', async () => {
      const mockResponse = { data: null };
      mockedApiGet.mockResolvedValue(mockResponse);

      const result = await conversationService.getUnreadCount();

      expect(result).toBe(0);
    });
  });
});