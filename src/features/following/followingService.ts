import { api } from "../auth/services/api";
import type {
  BlockedUsersResponse,
  FollowStatus,
  SuggestedUsersResponse,
  UserFollowersResponse,
  UserFollowingResponse,
} from "../../shared/types/User";

export const followingService = {
  async getMeFollowing(page = 1, limit = 20): Promise<UserFollowingResponse> {
    const { data } = await api.get<UserFollowingResponse>(
      `/users/me/following?page=${page}&limit=${limit}`,
    );
    return data;
  },

  async getUserFollowing(
    userIdOrUsername: string,
    page = 1,
    limit = 20,
  ): Promise<UserFollowingResponse> {
    const { data } = await api.get<UserFollowingResponse>(
      `/users/${encodeURIComponent(userIdOrUsername)}/following?page=${page}&limit=${limit}`,
    );
    return data;
  },

  async getUserFollowers(
    userIdOrUsername: string,
    page = 1,
    limit = 20,
  ): Promise<UserFollowersResponse> {
    const { data } = await api.get<UserFollowersResponse>(
      `/users/${encodeURIComponent(userIdOrUsername)}/followers?page=${page}&limit=${limit}`,
    );
    return data;
  },

  async getFollowStatus(userId: string): Promise<FollowStatus> {
    const { data } = await api.get<FollowStatus>(
      `/users/${encodeURIComponent(userId)}/follow-status`,
    );
    return data;
  },

  async followUser(userId: string): Promise<void> {
    const encodedId = encodeURIComponent(userId);
    await api.post(`/users/${encodedId}/follow`);
  },

  async unfollowUser(userId: string): Promise<void> {
    const encodedId = encodeURIComponent(userId);
    await api.delete(`/users/${encodedId}/unfollow`);
  },

  async getBlockedUsers(page = 1, limit = 20): Promise<BlockedUsersResponse> {
    const { data } = await api.get<BlockedUsersResponse>(
      `/users/me/blocked-users?page=${page}&limit=${limit}`,
    );
    return data;
  },

  async blockUser(userId: string): Promise<void> {
    const encodedId = encodeURIComponent(userId);
    await api.post(`/users/${encodedId}/block`);
  },

  async unblockUser(userId: string): Promise<void> {
    const encodedId = encodeURIComponent(userId);
    await api.delete(`/users/${encodedId}/unblock`);
  },

  async getSuggestedUsers(
    page = 1,
    limit = 10,
  ): Promise<SuggestedUsersResponse> {
    const { data } = await api.get<SuggestedUsersResponse>(
      `/users/me/suggested?page=${page}&limit=${limit}`,
    );
    return data;
  },
};
