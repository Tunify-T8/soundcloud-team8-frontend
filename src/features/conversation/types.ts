export interface User {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
}

export interface ConversationSummary {
  conversationId: string;
  otherUser: User;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  status: "ACTIVE" | "ARCHIVED" | "BLOCKED";
}

export interface ConversationApiItem {
  conversationId?: string;
  id?: string;
  otherUser?: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string | null;
  };
  user1Id?: string;
  user2Id?: string;
  status?: "ACTIVE" | "ARCHIVED" | "BLOCKED";
  unreadCount: number;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
  lastMessage?: {
    id?: string;
    content?: string | null;
    text?: string | null;
    createdAt?: string;
  } | null;
  updatedAt?: string;
}

export interface GetConversationsResponse {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  items?: ConversationApiItem[];
  data?: ConversationApiItem[];
}

export interface CreateConversationRequest {
  userId: string;
}

export interface CreateConversationResponse {
  id: string;
  user1Id: string;
  user2Id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageType =
  | "TEXT"
  | "TRACK_LIKE"
  | "TRACK_UPLOAD"
  | "PLAYLIST"
  | "ALBUM"
  | "USER";

export interface MessageAttachment {
  id?: string | null;
  type?: MessageType;
  preview?: Record<string, unknown> | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  type: MessageType;
  content?: string | null;
  read: boolean;
  createdAt: string;
  attachment?: MessageAttachment | null;
  isPending?: boolean;
}

export interface GetMessagesResponse {
  conversationId?: string;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  messages?: MessageApiItem[];
  data?: MessageApiItem[];
}

export interface MessageApiItem {
  id: string;
  conversationId?: string;
  senderId?: string;
  sender?: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  };
  type: MessageType;
  content?: string | null;
  text?: string | null;
  read: boolean;
  createdAt: string;
  attachment?: MessageAttachment | null;
}

export interface SocketMessageReceived {
  conversationId: string;
  message: {
    id: string;
    conversationId: string;
    sender: {
      id: string;
      username: string;
      avatarUrl: string | null;
    };
    type: MessageType;
    text: string | null;
    createdAt: string;
    read: boolean;
    attachment?: MessageAttachment | null;
  };
}

export interface SocketMessageSent {
  messageId: string;
  tempId?: string;
}

export interface SocketTypingPayload {
  conversationId: string;
  userId: string;
}

export interface SocketReadPayload {
  conversationId: string;
  messageId: string;
  readerId?: string;
}

export interface SendMessagePayload {
  conversationId: string;
  type: MessageType;
  content?: string | null;
  trackId?: string | null;
  collectionId?: string | null;
  userId?: string | null;
  tempId?: string;
}