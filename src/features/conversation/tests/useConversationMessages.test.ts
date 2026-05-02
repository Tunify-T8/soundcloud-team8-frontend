import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useConversationMessages } from '../useConversationMessages';
import { conversationService } from '../../conversationService';
import type { Message } from '../../types';

// Mock the service
vi.mock('../../conversationService', () => ({
  conversationService: {
    getMessages: vi.fn(),
  },
}));

const mockedGetMessages = vi.mocked(conversationService.getMessages);

describe('useConversationMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state when no conversationId', () => {
    const { result } = renderHook(() => useConversationMessages(null));

    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('should fetch messages for single page conversation', async () => {
    const mockMessages: Message[] = [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        sender: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
        type: 'TEXT',
        content: 'Hello',
        read: false,
        createdAt: '2024-01-01T00:00:00Z',
        attachment: null,
      },
    ];

    mockedGetMessages.mockResolvedValue({
      messages: mockMessages,
      hasNextPage: false,
      total: 1,
      totalPages: 1,
    });

    const { result } = renderHook(() => useConversationMessages('conv-1'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedGetMessages).toHaveBeenCalledWith('conv-1', 1, 20);
    expect(result.current.messages).toEqual(mockMessages);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('should fetch last page for multi-page conversation', async () => {
    const firstPageMessages: Message[] = [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        sender: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
        type: 'TEXT',
        content: 'First page',
        read: false,
        createdAt: '2024-01-01T00:00:00Z',
        attachment: null,
      },
    ];

    const lastPageMessages: Message[] = [
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        senderId: 'user-2',
        sender: { id: 'user-2', displayName: 'User 2', avatarUrl: null },
        type: 'TEXT',
        content: 'Last page',
        read: false,
        createdAt: '2024-01-02T00:00:00Z',
        attachment: null,
      },
    ];

    mockedGetMessages
      .mockResolvedValueOnce({
        messages: firstPageMessages,
        hasNextPage: true,
        total: 2,
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        messages: lastPageMessages,
        hasNextPage: false,
        total: 2,
        totalPages: 2,
      });

    const { result } = renderHook(() => useConversationMessages('conv-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedGetMessages).toHaveBeenCalledTimes(2);
    expect(mockedGetMessages).toHaveBeenNthCalledWith(1, 'conv-1', 1, 20);
    expect(mockedGetMessages).toHaveBeenNthCalledWith(2, 'conv-1', 2, 20);
    expect(result.current.messages).toEqual(lastPageMessages);
    expect(result.current.currentPage).toBe(2);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('should handle fetch error', async () => {
    mockedGetMessages.mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useConversationMessages('conv-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load messages. Please try again.');
    expect(result.current.messages).toEqual([]);
  });

  it('should refetch when conversationId changes', async () => {
    const messages1: Message[] = [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        sender: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
        type: 'TEXT',
        content: 'Conv 1',
        read: false,
        createdAt: '2024-01-01T00:00:00Z',
        attachment: null,
      },
    ];

    const messages2: Message[] = [
      {
        id: 'msg-2',
        conversationId: 'conv-2',
        senderId: 'user-2',
        sender: { id: 'user-2', displayName: 'User 2', avatarUrl: null },
        type: 'TEXT',
        content: 'Conv 2',
        read: false,
        createdAt: '2024-01-01T00:00:00Z',
        attachment: null,
      },
    ];

    mockedGetMessages
      .mockResolvedValueOnce({
        messages: messages1,
        hasNextPage: false,
        total: 1,
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        messages: messages2,
        hasNextPage: false,
        total: 1,
        totalPages: 1,
      });

    const { result, rerender } = renderHook(
      (convId) => useConversationMessages(convId),
      { initialProps: 'conv-1' }
    );

    await waitFor(() => {
      expect(result.current.messages).toEqual(messages1);
    });

    rerender('conv-2');

    await waitFor(() => {
      expect(result.current.messages).toEqual(messages2);
    });

    expect(mockedGetMessages).toHaveBeenCalledTimes(2);
  });

  it('should load earlier messages', async () => {
    const lastPageMessages: Message[] = [
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        senderId: 'user-2',
        sender: { id: 'user-2', displayName: 'User 2', avatarUrl: null },
        type: 'TEXT',
        content: 'Last page',
        read: false,
        createdAt: '2024-01-02T00:00:00Z',
        attachment: null,
      },
    ];

    const earlierMessages: Message[] = [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        sender: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
        type: 'TEXT',
        content: 'Earlier message',
        read: false,
        createdAt: '2024-01-01T00:00:00Z',
        attachment: null,
      },
    ];

    mockedGetMessages
      .mockResolvedValueOnce({
        messages: lastPageMessages,
        hasNextPage: true,
        total: 2,
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        messages: earlierMessages,
        hasNextPage: false,
        total: 2,
        totalPages: 2,
      });

    const { result } = renderHook(() => useConversationMessages('conv-1'));

    await waitFor(() => {
      expect(result.current.messages).toEqual(lastPageMessages);
      expect(result.current.currentPage).toBe(2);
    });

    mockedGetMessages.mockResolvedValueOnce({
      messages: earlierMessages,
      hasNextPage: false,
      total: 2,
      totalPages: 2,
    });

    await act(async () => {
      await result.current.loadEarlier();
    });

    expect(result.current.messages).toEqual([...earlierMessages, ...lastPageMessages]);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('should not load earlier when at first page', async () => {
    const messages: Message[] = [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        sender: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
        type: 'TEXT',
        content: 'Message',
        read: false,
        createdAt: '2024-01-01T00:00:00Z',
        attachment: null,
      },
    ];

    mockedGetMessages.mockResolvedValue({
      messages,
      hasNextPage: false,
      total: 1,
      totalPages: 1,
    });

    const { result } = renderHook(() => useConversationMessages('conv-1'));

    await waitFor(() => {
      expect(result.current.currentPage).toBe(1);
    });

    await act(async () => {
      await result.current.loadEarlier();
    });

    expect(mockedGetMessages).toHaveBeenCalledTimes(1); // Only initial load
  });

  it('should append message', async () => {
    mockedGetMessages.mockResolvedValue({
      messages: [],
      hasNextPage: false,
      total: 0,
      totalPages: 1,
    });

    const { result } = renderHook(() => useConversationMessages('conv-1'));

    await waitFor(() => {
      expect(result.current.messages).toEqual([]);
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
      result.current.appendMessage(newMessage);
    });

    expect(result.current.messages).toEqual([newMessage]);
  });

  it('should not append duplicate message', async () => {
    const existingMessage: Message = {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-1',
      sender: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
      type: 'TEXT',
      content: 'Existing',
      read: false,
      createdAt: '2024-01-01T00:00:00Z',
      attachment: null,
    };

    mockedGetMessages.mockResolvedValue({
      messages: [existingMessage],
      hasNextPage: false,
      total: 1,
      totalPages: 1,
    });

    const { result } = renderHook(() => useConversationMessages('conv-1'));

    await waitFor(() => {
      expect(result.current.messages).toEqual([existingMessage]);
    });

    act(() => {
      result.current.appendMessage(existingMessage);
    });

    expect(result.current.messages).toEqual([existingMessage]);
  });

  it('should replace message with tempId', async () => {
    const tempMessage: Message = {
      id: 'temp-123',
      conversationId: 'conv-1',
      senderId: 'user-1',
      sender: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
      type: 'TEXT',
      content: 'Temp message',
      read: false,
      createdAt: '2024-01-01T00:00:00Z',
      attachment: null,
      isPending: true,
    };

    mockedGetMessages.mockResolvedValue({
      messages: [tempMessage],
      hasNextPage: false,
      total: 1,
      totalPages: 1,
    });

    const { result } = renderHook(() => useConversationMessages('conv-1'));

    await waitFor(() => {
      expect(result.current.messages[0].id).toBe('temp-123');
    });

    act(() => {
      result.current.replaceMessage('temp-123', 'real-456');
    });

    expect(result.current.messages[0].id).toBe('real-456');
    expect(result.current.messages[0].isPending).toBeUndefined();
  });

  it('should confirm latest message', async () => {
    const tempMessage: Message = {
      id: 'temp-123',
      conversationId: 'conv-1',
      senderId: 'user-1',
      sender: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
      type: 'TEXT',
      content: 'Temp message',
      read: false,
      createdAt: '2024-01-01T00:00:00Z',
      attachment: null,
      isPending: true,
    };

    const realMessage: Message = {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-1',
      sender: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
      type: 'TEXT',
      content: 'Real message',
      read: false,
      createdAt: '2024-01-01T00:00:00Z',
      attachment: null,
    };

    mockedGetMessages.mockResolvedValue({
      messages: [realMessage, tempMessage],
      hasNextPage: false,
      total: 2,
      totalPages: 1,
    });

    const { result } = renderHook(() => useConversationMessages('conv-1'));

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
    });

    act(() => {
      result.current.confirmLatestMessage('confirmed-789');
    });

    expect(result.current.messages[1].id).toBe('confirmed-789');
  });

  it('should mark message as read locally', async () => {
    const message: Message = {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-1',
      sender: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
      type: 'TEXT',
      content: 'Message',
      read: false,
      createdAt: '2024-01-01T00:00:00Z',
      attachment: null,
    };

    mockedGetMessages.mockResolvedValue({
      messages: [message],
      hasNextPage: false,
      total: 1,
      totalPages: 1,
    });

    const { result } = renderHook(() => useConversationMessages('conv-1'));

    await waitFor(() => {
      expect(result.current.messages[0].read).toBe(false);
    });

    act(() => {
      result.current.markLocalRead('msg-1');
    });

    expect(result.current.messages[0].read).toBe(true);
  });

  it('should refetch messages', async () => {
    const initialMessages: Message[] = [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        sender: { id: 'user-1', displayName: 'User 1', avatarUrl: null },
        type: 'TEXT',
        content: 'Initial',
        read: false,
        createdAt: '2024-01-01T00:00:00Z',
        attachment: null,
      },
    ];

    const refetchedMessages: Message[] = [
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        senderId: 'user-2',
        sender: { id: 'user-2', displayName: 'User 2', avatarUrl: null },
        type: 'TEXT',
        content: 'Refetched',
        read: false,
        createdAt: '2024-01-02T00:00:00Z',
        attachment: null,
      },
    ];

    mockedGetMessages
      .mockResolvedValueOnce({
        messages: initialMessages,
        hasNextPage: false,
        total: 1,
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        messages: refetchedMessages,
        hasNextPage: false,
        total: 1,
        totalPages: 1,
      });

    const { result } = renderHook(() => useConversationMessages('conv-1'));

    await waitFor(() => {
      expect(result.current.messages).toEqual(initialMessages);
    });

    act(() => {
      result.current.refetch();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.messages).toEqual(refetchedMessages);
  });
});