import type { FeedResponse, FeedItem } from "@/shared/types/Feed";
import { api } from "@/features/auth/services/api";

export const feedService = {
  async getFeed(): Promise<FeedResponse | null> {
    try {
      const response = await api.get("/feed");
      return response.data as FeedResponse;
    } catch (error) {
      return null;
    }
  },
};
