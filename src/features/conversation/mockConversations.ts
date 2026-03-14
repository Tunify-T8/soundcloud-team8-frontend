import type { ConversationSummary } from "./types";

export const mockConversations: ConversationSummary[] = [
	{
		id: "conversation-1",
		participant: {
			id: "user-1",
			username: "Test User",
			avatarUrl: "",
		},
		lastMessagePreview: "asadasd",
		lastMessageAt: "2026-03-14T18:00:00.000Z",
		unreadCount: 1,
	},
	{
		id: "conversation-2",
		participant: {
			id: "user-2",
			username: "Jordan Beats",
			avatarUrl: "",
		},
		lastMessagePreview: "Can you send the updated track?",
		lastMessageAt: "2026-03-14T17:30:00.000Z",
		unreadCount: 0,
	},
	{
		id: "conversation-3",
		participant: {
			id: "user-3",
			username: "Ava Mix",
			avatarUrl: "",
		},
		lastMessagePreview: "Nice drop on that chorus.",
		lastMessageAt: "2026-03-13T21:10:00.000Z",
		unreadCount: 3,
	},
];
