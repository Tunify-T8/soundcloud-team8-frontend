import { mockConversations } from "./mockConversations";
import type { Message, User } from "./types";

const currentUser: User = {
	id: "current-user-uuid",
	displayName: "You",
	avatarUrl: "",
};

function createMessage(
	id: string,
	conversationId: string,
	sender: User,
	receiverId: string,
	text: string,
	createdAt: string,
): Message {
	return {
		id,
		conversationId,
		senderId: sender.id,
		sender,
		receiverId,
		type: "TEXT",
		text,
		createdAt,
		status: "READ",
	};
}

export function getMockMessagesByConversationId(conversationId: string): Message[] {
	const conversation = mockConversations.find((item) => item.conversationId === conversationId);

	if (!conversation) {
		return [];
	}

	const otherUser = conversation.otherUser;

	return [
		createMessage(
			`msg-${conversationId}-1`,
			conversationId,
			otherUser,
			currentUser.id,
			`Hey, this is ${otherUser.displayName}. Want feedback on your latest mix?`,
			"2026-03-14T16:05:00.000Z",
		),
		createMessage(
			`msg-${conversationId}-2`,
			conversationId,
			currentUser,
			otherUser.id,
			"Yes please, send your notes.",
			"2026-03-14T16:08:00.000Z",
		),
		createMessage(
			`msg-${conversationId}-3`,
			conversationId,
			otherUser,
			currentUser.id,
			conversation.lastMessagePreview,
			conversation.lastMessageAt,
		),
	];
}
