import { api } from "../../services/api";
import type {
	ConversationSummary,
	GetConversationsResponse,
	CreateConversationRequest,
	CreateConversationResponse,
	MessagePayload,
	Message,
	GetMessagesResponse,
} from "./types";

export const conversationService = {
	async getConversationsSummary(page = 1, limit = 20): Promise<ConversationSummary[]> {
		const { data } = await api.get<GetConversationsResponse>(
			`/me/conversations?page=${page}&limit=${limit}`,
		);
		return data.data;
	},

	async createOrGetConversation(userId: string): Promise<string> {
		const { data } = await api.post<CreateConversationResponse>("/me/conversations", {
			userId,
		} as CreateConversationRequest);
		return data.conversationId;
	},

	async sendMessage(conversationId: string, payload: MessagePayload): Promise<void> {
		await api.post(`/conversations/${conversationId}/messages`, payload);
	},

	async getMessages(conversationId: string, page = 1, limit = 20): Promise<Message[]> {
		const { data } = await api.get<GetMessagesResponse>(
			`/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
		);
		return data.data;
	},

	async markConversationAsRead(conversationId: string): Promise<void> {
		await api.post(`/conversations/${conversationId}/read`);
	},
};
