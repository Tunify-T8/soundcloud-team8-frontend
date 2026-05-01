import { api } from "@/features/auth/services/api";
import type {
  ConversationSummary,
  ConversationApiItem,
  GetConversationsResponse,
  CreateConversationResponse,
  GetMessagesResponse,
  Message,
  MessageApiItem,
} from "./types";

function normaliseConversation(item: ConversationApiItem): ConversationSummary {
  const convId = item.conversationId ?? item.id ?? "";

  const otherUser = item.otherUser
    ? {
        id: item.otherUser.id,
        displayName: item.otherUser.username || item.otherUser.displayName || `User ${item.otherUser.id.slice(0, 6)}`,
        avatarUrl: item.otherUser.avatarUrl ?? null,
      }
    : {
        id: item.user2Id ?? "",
        displayName: `User ${(item.user2Id ?? "").slice(0, 6)}`,
        avatarUrl: null,
      };

  const lastText =
    item.lastMessagePreview ??
    item.lastMessage?.content ??
    item.lastMessage?.text ??
    null;

  const lastAt =
    item.lastMessageAt ??
    item.lastMessage?.createdAt ??
    item.updatedAt ??
    null;

  return {
    conversationId: convId,
    otherUser,
    lastMessagePreview: lastText,
    lastMessageAt: lastAt,
    unreadCount: item.unreadCount ?? 0,
    status: item.status ?? "ACTIVE",
  };
}

function normaliseMessage(raw: MessageApiItem, fallbackConvId?: string): Message {
  const senderId = raw.sender?.id ?? raw.senderId ?? "";
  const content = raw.content ?? raw.text ?? null;

  return {
    id: raw.id,
    conversationId: raw.conversationId ?? fallbackConvId ?? "",
    senderId,
    sender: {
      id: senderId,
      displayName: raw.sender?.username ?? `User ${senderId.slice(0, 6)}`,
      avatarUrl: raw.sender?.avatarUrl ?? null,
    },
    type: raw.type,
    content,
    read: raw.read,
    createdAt: raw.createdAt,
    attachment: raw.attachment ?? null,
  };
}

export const conversationService = {
  async getConversationsSummary(
    currentUserId: string,
    page = 1,
    limit = 20,
  ): Promise<ConversationSummary[]> {
    const { data } = await api.get<GetConversationsResponse>(
      `/users/me/conversations`,
      { params: { page, limit } },
    );

    const list: ConversationApiItem[] = Array.isArray(data)
      ? (data as unknown as ConversationApiItem[])
      : (data?.items ?? data?.data ?? []);

    return list.map((item) => normaliseConversation(item));
  },

  async createOrGetConversation(userId: string): Promise<string> {
    const { data } = await api.post<CreateConversationResponse>(
      "/users/me/conversations",
      { userId },
    );

    const id = (data as any).id ?? (data as any).conversationId ?? "";
    if (!id) throw new Error("Server did not return a conversation ID");
    return id.toString();
  },

  async getMessages(
  conversationId: string,
  page = 1,
  limit = 20,
): Promise<{ messages: Message[]; hasNextPage: boolean; total: number; totalPages: number }> {
  const { data } = await api.get<GetMessagesResponse>(
    `/conversations/${conversationId}/messages`,
    { params: { page, limit } },
  );

  const rawItems: MessageApiItem[] = data.messages ?? data.data ?? [];
  const messages = rawItems.map((m) => normaliseMessage(m, conversationId));

  return {
    messages,
    hasNextPage: data.hasNextPage ?? false,
    total: data.total ?? messages.length,
    totalPages: data.totalPages ?? 1,
  };
},

  async markConversationAsRead(conversationId: string): Promise<void> {
    await api.post(`/conversations/${conversationId}/read`);
  },

  async markConversationAsUnread(conversationId: string): Promise<void> {
    await api.post(`/conversations/${conversationId}/unread`);
  },

  async archiveConversation(conversationId: string): Promise<void> {
    await api.post(`/conversations/${conversationId}/archive`);
  },

  async deleteConversation(conversationId: string): Promise<void> {
    await api.delete(`/conversations/${conversationId}`);
  },

  async blockUser(
    conversationId: string,
    removeComments = false,
    reportSpam = false,
  ): Promise<void> {
    await api.post(`/conversations/${conversationId}/block`, {
      removeComments,
      reportSpam,
    });
  },

  async unblockUser(blockedUserId: string): Promise<void> {
    await api.post(`/conversations/unblock/${blockedUserId}`);
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await api.get<{ unreadCount: number }>(
      "/me/messages/unread-count",
    );
    return data?.unreadCount ?? 0;
  },
};