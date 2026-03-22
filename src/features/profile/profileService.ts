import axiosInstance from "../auth/services/axiosInstance";
import type {
  MeUserProfile,
  PublicUserProfile,
  UpdateUserProfileRequest,
  UserGenres,
  UserTracksResponse,
  UserFollowingResponse,
} from "../../shared/types/User";

export const profileService = {
  async getMeProfile(): Promise<MeUserProfile> {
    const { data } = await axiosInstance.get<MeUserProfile>("/users/me");
    return data;
  },

  async getPublicProfile(userIdOrUsername: string): Promise<PublicUserProfile> {
    const { data } = await axiosInstance.get<PublicUserProfile>(
      `/users/${encodeURIComponent(userIdOrUsername)}`,
    );
    return data;
  },

  async updateMeProfile(
    payload: UpdateUserProfileRequest,
  ): Promise<MeUserProfile> {
    const { data } = await axiosInstance.patch<MeUserProfile>(
      "/users/me/profile",
      payload,
    );
    return data;
  },

  async getMeSocialLinks(): Promise<{
    instagram?: string;
    twitter?: string;
    website?: string;
  }> {
    const { data } = await axiosInstance.get<
      { platform: string; url: string }[]
    >("/users/me/social-links");
    const result: { instagram?: string; twitter?: string; website?: string } =
      {};
    for (const link of data ?? []) {
      if (link.platform === "INSTAGRAM") result.instagram = link.url;
      if (link.platform === "TWITTER") result.twitter = link.url;
      if (link.platform === "WEBSITE") result.website = link.url;
    }
    return result;
  },

  async updateMeSocialLinks(payload: {
    links: { platform: string; url: string }[];
  }): Promise<void> {
    await axiosInstance.patch("/users/me/social-links", payload);
  },

  async getMeGenres(): Promise<UserGenres> {
    const { data } = await axiosInstance.get<UserGenres>("/users/me/genres");
    return data;
  },

  async updateMeGenres(payload: UserGenres): Promise<UserGenres> {
    const { data } = await axiosInstance.patch<UserGenres>(
      "/users/me/genres",
      payload,
    );
    return data;
  },

  async getMeTracks(page = 1, limit = 20): Promise<UserTracksResponse> {
    const { data } = await axiosInstance.get<UserTracksResponse>(
      `/users/me/tracks?page=${page}&limit=${limit}`,
    );
    return data;
  },

  async getMeFollowing(page = 1, limit = 20): Promise<UserFollowingResponse> {
    const { data } = await axiosInstance.get<UserFollowingResponse>(
      `/users/me/following?page=${page}&limit=${limit}`,
    );
    return data;
  },

  async getUserFollowing(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<UserFollowingResponse> {
    const { data } = await axiosInstance.get<UserFollowingResponse>(
      `/users/${encodeURIComponent(userId)}/following?page=${page}&limit=${limit}`,
    );
    return data;
  },
};
