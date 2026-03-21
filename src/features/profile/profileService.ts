import axiosInstance from "../auth/services/axiosInstance";
import type {
  MeUserProfile,
  PublicUserProfile,
  UpdateUserProfileRequest,
  UserSocialLinks,
  UserGenres,
  UserTracksResponse,
  UserFollowingResponse,
} from "../../shared/types/User";

export const profileService = {
  async getMeProfile(): Promise<MeUserProfile> {
    const { data } = await axiosInstance.get<{ user: MeUserProfile }>(
      "/users/me",
    );
    return data.user;
  },

  async getPublicProfile(userIdOrUsername: string): Promise<PublicUserProfile> {
    const { data } = await axiosInstance.get<{ user: PublicUserProfile }>(
      `/users/${encodeURIComponent(userIdOrUsername)}`,
    );
    return data.user;
  },

  async updateMeProfile(
    payload: UpdateUserProfileRequest,
  ): Promise<MeUserProfile> {
    const { data } = await axiosInstance.patch<{ user: MeUserProfile }>(
      "/users/me/profile",
      payload,
    );
    return data.user;
  },

  async getMeSocialLinks(): Promise<UserSocialLinks> {
    const { data } = await axiosInstance.get<{ socialLinks: UserSocialLinks }>(
      "/users/me/social-links",
    );
    return data.socialLinks;
  },

  async updateMeSocialLinks(
    payload: UserSocialLinks,
  ): Promise<UserSocialLinks> {
    const { data } = await axiosInstance.patch<{
      socialLinks: UserSocialLinks;
    }>("/users/me/social-links_update", payload);
    return data.socialLinks;
  },

  async getMeGenres(): Promise<UserGenres> {
    const { data } = await axiosInstance.get<UserGenres>("/users/me/genres");
    return data;
  },

  async updateMeGenres(payload: UserGenres): Promise<UserGenres> {
    const { data } = await axiosInstance.patch<UserGenres>(
      "/users/me/genres-update",
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
