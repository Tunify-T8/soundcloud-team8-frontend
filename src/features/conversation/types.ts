export interface ConversationParticipant {
	id: string;
	username: string;
	avatarUrl?: string;
}

export interface ConversationSummary {
	id: string;
	participant: ConversationParticipant;
	lastMessagePreview: string;
	updatedAt: string;
	unreadCount: number;
}

export interface GetConversationsResponse {
	conversations: ConversationSummary[];
}
