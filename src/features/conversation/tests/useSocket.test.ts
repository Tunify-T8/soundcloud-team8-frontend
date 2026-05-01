import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSocket } from '../hooks/useSocket';
import { socketSingleton } from '../hooks/useSocket';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

import { io } from 'socket.io-client';
const mockedIo = vi.mocked(io);

describe('useSocket', () => {
  let mockSocket: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockSocket = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      removeAllListeners: vi.fn(),
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      connected: false,
      disconnected: true,
    };

    mockedIo.mockReturnValue(mockSocket);

    localStorageMock.getItem.mockReturnValue('mock-token');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize socket connection on mount', () => {
    renderHook(() => useSocket({ conversationId: null }));

    expect(localStorageMock.getItem).toHaveBeenCalledWith('sc_access_token');
    expect(mockedIo).toHaveBeenCalledWith('https://tunify.duckdns.org/conversations', {
      transports: ['websocket'],
      auth: { token: 'mock-token' },
      extraHeaders: { authorization: 'Bearer mock-token' },
      query: { token: 'mock-token' },
      path: '/socket.io',
      timeout: 10_000,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 10_000,
      forceNew: true,
    });
    expect(mockSocket.connect).toHaveBeenCalled();
  });

  it('should not connect if no token', () => {
    localStorageMock.getItem.mockReturnValue(null);

    renderHook(() => useSocket({ conversationId: null }));

    expect(mockedIo).not.toHaveBeenCalled();
  });

  it('should join room when conversationId provided', () => {
    mockSocket.connected = true;

    renderHook(() => useSocket({ conversationId: 'conv-1' }));

    expect(mockSocket.emit).toHaveBeenCalledWith('conversation:join', { conversationId: 'conv-1' });
  });

  it('should leave old room and join new room when conversationId changes', () => {
    mockSocket.connected = true;

    const { rerender } = renderHook(
      (props) => useSocket(props),
      { initialProps: { conversationId: 'conv-1' } }
    );

    expect(mockSocket.emit).toHaveBeenCalledWith('conversation:join', { conversationId: 'conv-1' });

    rerender({ conversationId: 'conv-2' });

    expect(mockSocket.emit).toHaveBeenCalledWith('conversation:leave', { conversationId: 'conv-1' });
    expect(mockSocket.emit).toHaveBeenCalledWith('conversation:join', { conversationId: 'conv-2' });
  });

  it('should send message', () => {
    mockSocket.connected = true;
    mockSocket.authenticated = true;

    const { result } = renderHook(() => useSocket({ conversationId: 'conv-1' }));

    const payload = {
      conversationId: 'conv-1',
      type: 'TEXT' as const,
      content: 'Hello',
      tempId: 'temp-123',
    };

    act(() => {
      result.current.sendMessage(payload);
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('message:send', payload);
  });

  it('should queue message when not ready', () => {
    mockSocket.connected = false;

    const { result } = renderHook(() => useSocket({ conversationId: 'conv-1' }));

    const payload = {
      conversationId: 'conv-1',
      type: 'TEXT' as const,
      content: 'Hello',
      tempId: 'temp-123',
    };

    act(() => {
      result.current.sendMessage(payload);
    });

    expect(mockSocket.emit).not.toHaveBeenCalledWith('message:send', payload);
  });

  it('should emit typing start', () => {
    const { result } = renderHook(() => useSocket({ conversationId: 'conv-1' }));

    act(() => {
      result.current.emitTypingStart('conv-1');
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('typing:start', { conversationId: 'conv-1' });
  });

  it('should emit typing stop', () => {
    const { result } = renderHook(() => useSocket({ conversationId: 'conv-1' }));

    act(() => {
      result.current.emitTypingStop('conv-1');
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('typing:stop', { conversationId: 'conv-1' });
  });

  it('should mark message as read', () => {
    const { result } = renderHook(() => useSocket({ conversationId: 'conv-1' }));

    act(() => {
      result.current.markMessageRead('conv-1', 'msg-123');
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('message:markRead', {
      conversationId: 'conv-1',
      messageId: 'msg-123',
    });
  });

  it('should return socket state', () => {
    mockSocket.connected = true;
    mockSocket.authenticated = true;

    const { result } = renderHook(() => useSocket({ conversationId: 'conv-1' }));

    const state = result.current.getSocketState();

    expect(state).toEqual({
      connected: true,
      authenticated: true,
      joinedConversation: 'conv-1',
    });
  });

  it('should handle message received callback', () => {
    let receivedMessage: any = null;

    const { result } = renderHook(() =>
      useSocket({
        conversationId: null,
        onMessageReceived: (message) => {
          receivedMessage = message;
        },
      })
    );

    // Simulate socket event
    const mockMessage = {
      id: 'msg-1',
      conversationId: 'conv-1',
      sender: { id: 'user-1', username: 'testuser', avatarUrl: 'avatar.jpg' },
      type: 'TEXT',
      text: 'Hello',
      read: false,
      createdAt: '2024-01-01T00:00:00Z',
      attachment: null,
    };

    // Trigger the socket event handler
    const connectCallback = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'message:received'
    )?.[1];

    act(() => {
      connectCallback?.({
        conversationId: 'conv-1',
        message: mockMessage,
      });
    });

    expect(receivedMessage).toEqual({
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-1',
      sender: {
        id: 'user-1',
        displayName: 'testuser',
        avatarUrl: 'avatar.jpg',
      },
      type: 'TEXT',
      content: 'Hello',
      read: false,
      createdAt: '2024-01-01T00:00:00Z',
      attachment: null,
    });
  });

  it('should handle message sent callback', () => {
    let sentMessageId: string | undefined;
    let sentTempId: string | undefined;

    const { result } = renderHook(() =>
      useSocket({
        conversationId: null,
        onMessageSent: (messageId, tempId) => {
          sentMessageId = messageId;
          sentTempId = tempId;
        },
      })
    );

    const messageSentCallback = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'message:sent'
    )?.[1];

    act(() => {
      messageSentCallback?.({
        messageId: 'msg-123',
        tempId: 'temp-456',
      });
    });

    expect(sentMessageId).toBe('msg-123');
    expect(sentTempId).toBe('temp-456');
  });

  it('should handle message read callback', () => {
    let readPayload: any = null;

    const { result } = renderHook(() =>
      useSocket({
        conversationId: null,
        onMessageRead: (payload) => {
          readPayload = payload;
        },
      })
    );

    const messageReadCallback = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'message:read'
    )?.[1];

    const mockPayload = { conversationId: 'conv-1', messageId: 'msg-123' };

    act(() => {
      messageReadCallback?.(mockPayload);
    });

    expect(readPayload).toEqual(mockPayload);
  });

  it('should handle typing active callback', () => {
    let typingPayload: any = null;

    const { result } = renderHook(() =>
      useSocket({
        conversationId: null,
        onTypingActive: (payload) => {
          typingPayload = payload;
        },
      })
    );

    const typingActiveCallback = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'typing:active'
    )?.[1];

    const mockPayload = { conversationId: 'conv-1', userId: 'user-123' };

    act(() => {
      typingActiveCallback?.(mockPayload);
    });

    expect(typingPayload).toEqual(mockPayload);
  });

  it('should handle typing inactive callback', () => {
    let typingPayload: any = null;

    const { result } = renderHook(() =>
      useSocket({
        conversationId: null,
        onTypingInactive: (payload) => {
          typingPayload = payload;
        },
      })
    );

    const typingInactiveCallback = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'typing:inactive'
    )?.[1];

    const mockPayload = { conversationId: 'conv-1', userId: 'user-123' };

    act(() => {
      typingInactiveCallback?.(mockPayload);
    });

    expect(typingPayload).toEqual(mockPayload);
  });

  it('should handle connection events', () => {
    renderHook(() => useSocket({ conversationId: null }));

    const connectCallback = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'connect'
    )?.[1];

    act(() => {
      connectCallback?.();
    });

    // Should re-join rooms, but since no rooms joined yet, no emit calls
    expect(mockSocket.emit).not.toHaveBeenCalledWith('conversation:join', expect.any(Object));
  });

  it('should handle authentication event', () => {
    renderHook(() => useSocket({ conversationId: 'conv-1' }));

    const authenticatedCallback = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'authenticated'
    )?.[1];

    act(() => {
      authenticatedCallback?.();
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('conversation:join', { conversationId: 'conv-1' });
  });

  it('should handle joined event', () => {
    renderHook(() => useSocket({ conversationId: null }));

    const joinedCallback = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'joined'
    )?.[1];

    act(() => {
      joinedCallback?.({ conversationId: 'conv-1' });
    });

    // Should flush pending messages, but since no pending, no emit calls
    expect(mockSocket.emit).not.toHaveBeenCalledWith('message:send', expect.any(Object));
  });
});