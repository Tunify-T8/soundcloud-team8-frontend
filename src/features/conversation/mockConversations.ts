import type { ConversationSummary } from "./types";

export const mockConversations: ConversationSummary[] = [
	{
		conversationId: "conv-uuid-1",
		otherUser: {
			id: "user-uuid-1",
			displayName: "Test User",
			avatarUrl: "",
		},
		lastMessagePreview: "Shared 2 tracks",
		lastMessageAt: "2026-03-14T18:00:00.000Z",
		unreadCount: 1,
	},
	{
		conversationId: "conv-uuid-2",
		otherUser: {
			id: "user-uuid-2",
			displayName: "Jordan Beats",
			avatarUrl: "",
		},
		lastMessagePreview: "Can you send the updated track?",
		lastMessageAt: "2026-03-14T17:30:00.000Z",
		unreadCount: 0,
	},
	{
		conversationId: "conv-uuid-3",
		otherUser: {
			id: "user-uuid-3",
			displayName: "Ava Mix",
			avatarUrl: "",
		},
		lastMessagePreview: "Nice drop on that chorus.",
		lastMessageAt: "2026-03-13T21:10:00.000Z",
		unreadCount: 3,
	},
];
