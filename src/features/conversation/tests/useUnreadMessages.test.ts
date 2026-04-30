import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
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

describe('useUnreadMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with 0 unread messages when no userId', () => {
    const { result } = renderHook(() => useUnreadMessages(null));

    expect(result.current.unreadMessages).toBe(0);
  });

  it('should fetch unread count on mount when userId provided', async () => {
    const mockConversations = [
      { conversationId: 'conv-1', unreadCount: 2, otherUser: { id: 'u1', displayName: 'U1', avatarUrl: null }, lastMessagePreview: null, lastMessageAt: null, status: 'ACTIVE' as const },
      { conversationId: 'conv-2', unreadCount: 3, otherUser: { id: 'u2', displayName: 'U2', avatarUrl: null }, lastMessagePreview: null, lastMessageAt: null, status: 'ACTIVE' as const },
    ];

    mockedGetConversationsSummary.mockResolvedValue(mockConversations);

    const { result } = renderHook(() => useUnreadMessages('user-123'));

    await waitFor(() => {
      expect(result.current.unreadMessages).toBe(5);
    });

    expect(mockedGetConversationsSummary).toHaveBeenCalledWith();
  });

  it('should handle fetch error gracefully', async () => {
    mockedGetConversationsSummary.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useUnreadMessages('user-123'));

    // Should remain 0 since error is silently ignored
    expect(result.current.unreadMessages).toBe(0);
  });

  it('should refetch when userId changes', async () => {
    const conversations1 = [
      { conversationId: 'conv-1', unreadCount: 1, otherUser: { id: 'u1', displayName: 'U1', avatarUrl: null }, lastMessagePreview: null, lastMessageAt: null, status: 'ACTIVE' as const },
    ];
    const conversations2 = [
      { conversationId: 'conv-2', unreadCount: 4, otherUser: { id: 'u2', displayName: 'U2', avatarUrl: null }, lastMessagePreview: null, lastMessageAt: null, status: 'ACTIVE' as const },
    ];

    mockedGetConversationsSummary
      .mockResolvedValueOnce(conversations1)
      .mockResolvedValueOnce(conversations2);

    const { result, rerender } = renderHook(
      (userId) => useUnreadMessages(userId),
      { initialProps: 'user-123' }
    );

    await waitFor(() => {
      expect(result.current.unreadMessages).toBe(1);
    });

    rerender('user-456');

    await waitFor(() => {
      expect(result.current.unreadMessages).toBe(4);
    });

    expect(mockedGetConversationsSummary).toHaveBeenCalledTimes(2);
  });

  it('should poll for updates every 60 seconds', async () => {
    const initialConversations = [
      { conversationId: 'conv-1', unreadCount: 1, otherUser: { id: 'u1', displayName: 'U1', avatarUrl: null }, lastMessagePreview: null, lastMessageAt: null, status: 'ACTIVE' as const },
    ];
    const updatedConversations = [
      { conversationId: 'conv-1', unreadCount: 2, otherUser: { id: 'u1', displayName: 'U1', avatarUrl: null }, lastMessagePreview: null, lastMessageAt: null, status: 'ACTIVE' as const },
    ];

    mockedGetConversationsSummary
      .mockResolvedValueOnce(initialConversations)
      .mockResolvedValueOnce(updatedConversations);

    const { result } = renderHook(() => useUnreadMessages('user-123'));

    await waitFor(() => {
      expect(result.current.unreadMessages).toBe(1);
    });

    // Advance time by 60 seconds
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    await waitFor(() => {
      expect(result.current.unreadMessages).toBe(2);
    });

    expect(mockedGetConversationsSummary).toHaveBeenCalledTimes(2);
  });

  it('should handle socket message received', async () => {
    const initialConversations = [
      { conversationId: 'conv-1', unreadCount: 1, otherUser: { id: 'u1', displayName: 'U1', avatarUrl: null }, lastMessagePreview: null, lastMessageAt: null, status: 'ACTIVE' as const },
    ];
    const updatedConversations = [
      { conversationId: 'conv-1', unreadCount: 2, otherUser: { id: 'u1', displayName: 'U1', avatarUrl: null }, lastMessagePreview: null, lastMessageAt: null, status: 'ACTIVE' as const },
    ];

    mockedGetConversationsSummary
      .mockResolvedValueOnce(initialConversations)
      .mockResolvedValueOnce(updatedConversations);

    let onMessageReceived: ((message: Message) => void) | undefined;

    mockedSocketSubscribe.mockImplementation((callback) => {
      onMessageReceived = (message) => callback({ type: 'message:received', message });
      return vi.fn();
    });

    // Mock window.location.pathname
    Object.defineProperty(window, 'location', {
      value: { pathname: '/messages/other-conv' },
      writable: true,
    });

    const { result } = renderHook(() => useUnreadMessages('user-123'));

    await waitFor(() => {
      expect(result.current.unreadMessages).toBe(1);
    });

    const newMessage: Message = {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'other-user',
      sender: { id: 'other-user', displayName: 'Other User', avatarUrl: null },
      type: 'TEXT',
      content: 'New message',
      read: false,
      createdAt: '2024-01-01T00:00:00Z',
      attachment: null,
    };

    act(() => {
      onMessageReceived?.(newMessage);
    });

    // Should trigger debounced refetch
    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.unreadMessages).toBe(2);
    });
  });

  it('should not refetch for messages from current user', async () => {
    mockedGetConversationsSummary.mockResolvedValue([]);

    let onMessageReceived: ((message: Message) => void) | undefined;

    mockedSocketSubscribe.mockImplementation((callback) => {
      onMessageReceived = (message) => callback({ type: 'message:received', message });
      return vi.fn();
    });

    const { result } = renderHook(() => useUnreadMessages('current-user'));

    await waitFor(() => {
      expect(result.current.unreadMessages).toBe(0);
    });

    const ownMessage: Message = {
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
      onMessageReceived?.(ownMessage);
    });

    // Should not trigger refetch
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockedGetConversationsSummary).toHaveBeenCalledTimes(1); // Only initial call
  });

  it('should not refetch when viewing the conversation', async () => {
    mockedGetConversationsSummary.mockResolvedValue([]);

    let onMessageReceived: ((message: Message) => void) | undefined;

    mockedSocketSubscribe.mockImplementation((callback) => {
      onMessageReceived = (message) => callback({ type: 'message:received', message });
      return vi.fn();
    });

    // Mock window.location.pathname to be viewing the conversation
    Object.defineProperty(window, 'location', {
      value: { pathname: '/messages/conv-1' },
      writable: true,
    });

    const { result } = renderHook(() => useUnreadMessages('user-123'));

    await waitFor(() => {
      expect(result.current.unreadMessages).toBe(0);
    });

    const newMessage: Message = {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'other-user',
      sender: { id: 'other-user', displayName: 'Other User', avatarUrl: null },
      type: 'TEXT',
      content: 'New message',
      read: false,
      createdAt: '2024-01-01T00:00:00Z',
      attachment: null,
    };

    act(() => {
      onMessageReceived?.(newMessage);
    });

    // Should not trigger refetch
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockedGetConversationsSummary).toHaveBeenCalledTimes(1); // Only initial call
  });

  it('should handle messages:read custom event', async () => {
    mockedGetConversationsSummary.mockResolvedValue([]);

    const { result } = renderHook(() => useUnreadMessages('user-123'));

    await waitFor(() => {
      expect(result.current.unreadMessages).toBe(0);
    });

    // Simulate setting unread count
    act(() => {
      result.current.unreadMessages = 5;
    });

    // Dispatch custom event
    const event = new CustomEvent('messages:read', {
      detail: { deduct: 2 },
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(result.current.unreadMessages).toBe(3);
  });

  it('should not go below 0 when deducting unread count', async () => {
    mockedGetConversationsSummary.mockResolvedValue([]);

    const { result } = renderHook(() => useUnreadMessages('user-123'));

    await waitFor(() => {
      expect(result.current.unreadMessages).toBe(0);
    });

    // Dispatch custom event with deduct > current count
    const event = new CustomEvent('messages:read', {
      detail: { deduct: 5 },
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(result.current.unreadMessages).toBe(0);
  });
});