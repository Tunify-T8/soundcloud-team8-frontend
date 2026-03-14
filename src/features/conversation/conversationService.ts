import { api } from "../../services/api";
import type { ConversationSummary, GetConversationsResponse } from "./types";

export const conversationService = {
  async getConversationsSummary(): Promise<ConversationSummary[]> {
    const { data } = await api.get<GetConversationsResponse>("/conversations");
    return data.conversations;
  },
};
