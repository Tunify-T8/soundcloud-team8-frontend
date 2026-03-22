import { api } from "../auth/services/api";
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
    const { data } = await api.get<MeUserProfile>("/users/me");
    return data;
  },

  async getPublicProfile(userIdOrUsername: string): Promise<PublicUserProfile> {
    const { data } = await api.get<PublicUserProfile>(
      `/users/${encodeURIComponent(userIdOrUsername)}`,
    );
    return data;
  },

  async updateMeProfile(
    payload: UpdateUserProfileRequest,
  ): Promise<MeUserProfile> {
    const { data } = await api.patch<MeUserProfile>(
      "/users/me/profile",
      payload,
    );
    return data;
  },

  async getMeSocialLinks(): Promise<UserSocialLinks> {
    const { data } = await api.get<UserSocialLinks>(
      "/users/me/social-links",
    );
    return data;
  },

  async updateMeSocialLinks(
    payload: UserSocialLinks,
  ): Promise<UserSocialLinks> {
    const { data } = await api.patch<UserSocialLinks>(
      "/users/me/social-links",
      payload,
    );
    return data;
  },

  async getMeGenres(): Promise<UserGenres> {
    const { data } = await api.get<UserGenres>("/users/me/genres");
    return data;
  },

  async updateMeGenres(payload: UserGenres): Promise<UserGenres> {
    const { data } = await api.patch<UserGenres>(
      "/users/me/genres",
      payload,
    );
    return data;
  },

  async getMeTracks(page = 1, limit = 20): Promise<UserTracksResponse> {
    const { data } = await api.get<UserTracksResponse>(
      `/users/me/tracks?page=${page}&limit=${limit}`,
    );
    return data;
  },

  async getMeFollowing(page = 1, limit = 20): Promise<UserFollowingResponse> {
    const { data } = await api.get<UserFollowingResponse>(
      `/users/me/following?page=${page}&limit=${limit}`,
    );
    return data;
  },

  async getUserFollowing(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<UserFollowingResponse> {
    const { data } = await api.get<UserFollowingResponse>(
      `/users/${encodeURIComponent(userId)}/following?page=${page}&limit=${limit}`,
    );
    return data;
  },
};
