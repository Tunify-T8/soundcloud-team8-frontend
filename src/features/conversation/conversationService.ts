import { api } from "../../services/api";
import type { ConversationSummary, GetConversationsResponse, FollowingUser } from "./types";

export const conversationService = {
  async getConversationsSummary(): Promise<ConversationSummary[]> {
    const { data } = await api.get<GetConversationsResponse>("/conversations");
    return data.conversations;
  },

  async getFollowings(): Promise<FollowingUser[]> {
    const { data } = await api.get<FollowingUser[]>("/followings");
    return data;
  },
};
