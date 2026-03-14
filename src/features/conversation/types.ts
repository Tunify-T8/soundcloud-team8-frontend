export interface ConversationParticipant {
	id: string;
	username: string;
	avatarUrl?: string;
}

export interface ConversationSummary {
	id: string;
	participant: ConversationParticipant;
	lastMessagePreview: string;
	lastMessageAt: string;
	unreadCount: number;
}

export interface GetConversationsResponse {
	conversations: ConversationSummary[];
}

export interface FollowingUser {
	id: string;
	username: string;
	avatarUrl?: string;
}
