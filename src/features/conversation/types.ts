export interface User {
	id: string;
	displayName: string;
	avatarUrl?: string;
}

export interface ConversationSummary {
	conversationId: string;
	otherUser: User;
	lastMessagePreview: string;
	lastMessageAt: string;
	unreadCount: number;
}

export interface GetConversationsResponse {
	data: ConversationSummary[];
}

export interface CreateConversationRequest {
	userId: string;
}

export interface CreateConversationResponse {
	conversationId: string;
}

export interface MessagePayload {
	type: "TEXT" | "ATTACHMENT";
	text?: string;
	attachments?: Array<{ id: string; type: "TRACK" | "COLLECTION" | "ALBUM" }>;
}

export interface Message {
	id: string;
	conversationId: string;
	senderId: string;
	sender: User;
	receiverId: string;
	type: "TEXT" | "ATTACHMENT";
	text?: string;
	createdAt: string;
	status: "SENT" | "DELIVERED" | "READ";
}

export interface GetMessagesResponse {
	data: Message[];
}
