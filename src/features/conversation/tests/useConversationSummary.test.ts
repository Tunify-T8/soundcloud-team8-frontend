import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useConversationSummary } from '../hooks/useConversationSummary';
import { conversationService } from '../conversationService';
import { socketSingleton } from '../hooks/useSocket';
import type { Message } from '../types';

// Mock the service
vi.mock('../conversationService', () => ({
  conversationService: {
    getConversationsSummary: vi.fn(),
  },
}));

// Mock the socket singleton
vi.mock('../hooks/useSocket', () => ({
  socketSingleton: {
    subscribe: vi.fn(),
  },
}));

const mockedGetConversationsSummary = vi.mocked(conversationService.getConversationsSummary);
const mockedSocketSubscribe = vi.mocked(socketSingleton.subscribe);

describe('useConversationSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with empty conversations when no userId', () => {
    mockedGetConversationsSummary.mockResolvedValue([]);

    const { result } = renderHook(() => useConversationSummary(null));

    expect(result.current.conversations).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should fetch conversations on mount when userId provided', async () => {
    const mockConversations = [
      {
        conversationId: 'conv-1',
        otherUser: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
        lastMessagePreview: 'Hello',
        lastMessageAt: '2024-01-01T00:00:00Z',
        unreadCount: 1,
        status: 'ACTIVE' as const,
      },
    ];

    mockedGetConversationsSummary.mockResolvedValue(mockConversations);

    const { result } = renderHook(() => useConversationSummary('user-123'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedGetConversationsSummary).toHaveBeenCalledWith();
    expect(result.current.conversations).toEqual(mockConversations);
    expect(result.current.error).toBe(null);
  });

  it('should handle fetch error', async () => {
    mockedGetConversationsSummary.mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useConversationSummary('user-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load conversations');
    expect(result.current.conversations).toEqual([]);
  });

  it('should refetch when userId changes', async () => {
    const mockConversations1 = [
      {
        conversationId: 'conv-1',
        otherUser: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
        lastMessagePreview: 'Hello',
        lastMessageAt: '2024-01-01T00:00:00Z',
        unreadCount: 1,
        status: 'ACTIVE' as const,
      },
    ];

    const mockConversations2 = [
      {
        conversationId: 'conv-2',
        otherUser: { id: 'user-2', displayName: 'User 2', avatarUrl: null },
        lastMessagePreview: 'Hi',
        lastMessageAt: '2024-01-02T00:00:00Z',
        unreadCount: 0,
        status: 'ACTIVE' as const,
      },
    ];

    mockedGetConversationsSummary
      .mockResolvedValueOnce(mockConversations1)
      .mockResolvedValueOnce(mockConversations2);

    const { result, rerender } = renderHook(
      (userId) => useConversationSummary(userId),
      { initialProps: 'user-123' }
    );

    await waitFor(() => {
      expect(result.current.conversations).toEqual(mockConversations1);
    });

    rerender('user-456');

    await waitFor(() => {
      expect(result.current.conversations).toEqual(mockConversations2);
    });

    expect(mockedGetConversationsSummary).toHaveBeenCalledTimes(2);
  });

  it('should handle message received from socket', async () => {
    const mockConversations = [
      {
        conversationId: 'conv-1',
        otherUser: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
        lastMessagePreview: null,
        lastMessageAt: null,
        unreadCount: 0,
        status: 'ACTIVE' as const,
      },
    ];

    mockedGetConversationsSummary.mockResolvedValue(mockConversations);

    let onMessageReceived: ((message: Message) => void) | undefined;

    mockedSocketSubscribe.mockImplementation((callback) => {
      onMessageReceived = (message) => callback({ type: 'message:received', message });
      return vi.fn();
    });

    const { result } = renderHook(() => useConversationSummary('user-123'));

    await waitFor(() => {
      expect(result.current.conversations).toEqual(mockConversations);
    });

    const newMessage: Message = {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-1',
      sender: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
      type: 'TEXT',
      content: 'New message',
      read: false,
      createdAt: '2024-01-01T00:00:00Z',
      attachment: null,
    };

    act(() => {
      onMessageReceived?.(newMessage);
    });

    expect(result.current.conversations[0].lastMessagePreview).toBe('New message');
    expect(result.current.conversations[0].lastMessageAt).toBe('2024-01-01T00:00:00Z');
    expect(result.current.conversations[0].unreadCount).toBe(1);
  });

  it('should not increment unread count for active conversation', async () => {
    const mockConversations = [
      {
        conversationId: 'conv-1',
        otherUser: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
        lastMessagePreview: null,
        lastMessageAt: null,
        unreadCount: 0,
        status: 'ACTIVE' as const,
      },
    ];

    mockedGetConversationsSummary.mockResolvedValue(mockConversations);

    let onMessageReceived: ((message: Message) => void) | undefined;

    mockedSocketSubscribe.mockImplementation((callback) => {
      onMessageReceived = (message) => callback({ type: 'message:received', message });
      return vi.fn();
    });

    const { result } = renderHook(() =>
      useConversationSummary('user-123', 'conv-1')
    );

    await waitFor(() => {
      expect(result.current.conversations).toEqual(mockConversations);
    });

    const newMessage: Message = {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-1',
      sender: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
      type: 'TEXT',
      content: 'New message',
      read: false,
      createdAt: '2024-01-01T00:00:00Z',
      attachment: null,
    };

    act(() => {
      onMessageReceived?.(newMessage);
    });

    expect(result.current.conversations[0].unreadCount).toBe(0);
  });

  it('should not increment unread count for messages from current user', async () => {
    const mockConversations = [
      {
        conversationId: 'conv-1',
        otherUser: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
        lastMessagePreview: null,
        lastMessageAt: null,
        unreadCount: 0,
        status: 'ACTIVE' as const,
      },
    ];

    mockedGetConversationsSummary.mockResolvedValue(mockConversations);

    let onMessageReceived: ((message: Message) => void) | undefined;

    mockedSocketSubscribe.mockImplementation((callback) => {
      onMessageReceived = (message) => callback({ type: 'message:received', message });
      return vi.fn();
    });

    const { result } = renderHook(() =>
      useConversationSummary('current-user')
    );

    await waitFor(() => {
      expect(result.current.conversations).toEqual(mockConversations);
    });

    const newMessage: Message = {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'current-user',
      sender: { id: 'current-user', displayName: 'Current User', avatarUrl: null },
      type: 'TEXT',
      content: 'My message',
      read: false,
      createdAt: '2024-01-01T00:00:00Z',
      attachment: null,
    };

    act(() => {
      onMessageReceived?.(newMessage);
    });

    expect(result.current.conversations[0].unreadCount).toBe(0);
  });

  it('should move conversation to top when new message received', async () => {
    const mockConversations = [
      {
        conversationId: 'conv-1',
        otherUser: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
        lastMessagePreview: 'Old message',
        lastMessageAt: '2024-01-01T00:00:00Z',
        unreadCount: 0,
        status: 'ACTIVE' as const,
      },
      {
        conversationId: 'conv-2',
        otherUser: { id: 'user-2', displayName: 'User 2', avatarUrl: null },
        lastMessagePreview: 'Another message',
        lastMessageAt: '2024-01-02T00:00:00Z',
        unreadCount: 0,
        status: 'ACTIVE' as const,
      },
    ];

    mockedGetConversationsSummary.mockResolvedValue(mockConversations);

    let onMessageReceived: ((message: Message) => void) | undefined;

    mockedSocketSubscribe.mockImplementation((callback) => {
      onMessageReceived = (message) => callback({ type: 'message:received', message });
      return vi.fn();
    });

    const { result } = renderHook(() => useConversationSummary('user-123'));

    await waitFor(() => {
      expect(result.current.conversations).toEqual(mockConversations);
    });

    const newMessage: Message = {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-1',
      sender: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
      type: 'TEXT',
      content: 'New message',
      read: false,
      createdAt: '2024-01-03T00:00:00Z',
      attachment: null,
    };

    act(() => {
      onMessageReceived?.(newMessage);
    });

    expect(result.current.conversations[0].conversationId).toBe('conv-1');
    expect(result.current.conversations[1].conversationId).toBe('conv-2');
  });

  it('should refetch unread counts after burst of messages', async () => {
    const mockConversations = [
      {
        conversationId: 'conv-1',
        otherUser: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
        lastMessagePreview: null,
        lastMessageAt: null,
        unreadCount: 0,
        status: 'ACTIVE' as const,
      },
    ];

    const updatedConversations = [
      {
        conversationId: 'conv-1',
        otherUser: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
        lastMessagePreview: 'Updated',
        lastMessageAt: '2024-01-01T00:00:00Z',
        unreadCount: 3,
        status: 'ACTIVE' as const,
      },
    ];

    mockedGetConversationsSummary
      .mockResolvedValueOnce(mockConversations)
      .mockResolvedValueOnce(updatedConversations);

    let onMessageReceived: ((message: Message) => void) | undefined;

    mockedSocketSubscribe.mockImplementation((callback) => {
      onMessageReceived = (message) => callback({ type: 'message:received', message });
      return vi.fn();
    });

    const { result } = renderHook(() => useConversationSummary('user-123'));

    await waitFor(() => {
      expect(result.current.conversations).toEqual(mockConversations);
    });

    // Send multiple messages quickly
    const messages = [
      { id: 'msg-1', content: 'Message 1' },
      { id: 'msg-2', content: 'Message 2' },
      { id: 'msg-3', content: 'Message 3' },
    ];

    messages.forEach((msg) => {
      const message: Message = {
        id: msg.id,
        conversationId: 'conv-1',
        senderId: 'user-1',
        sender: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
        type: 'TEXT',
        content: msg.content,
        read: false,
        createdAt: '2024-01-01T00:00:00Z',
        attachment: null,
      };

      act(() => {
        onMessageReceived?.(message);
      });
    });

    // Should have optimistic updates
    expect(result.current.conversations[0].unreadCount).toBe(3);

    // Advance timers to trigger refetch
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(result.current.conversations[0].unreadCount).toBe(3);
    });

    expect(mockedGetConversationsSummary).toHaveBeenCalledTimes(2);
  });

  it('should call refetch function', async () => {
    mockedGetConversationsSummary.mockResolvedValue([]);

    const { result } = renderHook(() => useConversationSummary('user-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockedGetConversationsSummary.mockResolvedValue([
      {
        conversationId: 'conv-1',
        otherUser: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
        lastMessagePreview: 'Refetched',
        lastMessageAt: '2024-01-01T00:00:00Z',
        unreadCount: 1,
        status: 'ACTIVE' as const,
      },
    ]);

    act(() => {
      result.current.refetch();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.conversations[0].lastMessagePreview).toBe('Refetched');
  });

  it('should set conversations via setConversations', async () => {
    mockedGetConversationsSummary.mockResolvedValue([]);

    const { result } = renderHook(() => useConversationSummary('user-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const newConversations = [
      {
        conversationId: 'conv-1',
        otherUser: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
        lastMessagePreview: 'Set externally',
        lastMessageAt: '2024-01-01T00:00:00Z',
        unreadCount: 1,
        status: 'ACTIVE' as const,
      },
    ];

    act(() => {
      result.current.setConversations(newConversations);
    });

    expect(result.current.conversations).toEqual(newConversations);
  });
});