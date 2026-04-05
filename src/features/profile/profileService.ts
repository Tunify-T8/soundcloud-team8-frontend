import { api } from "../auth/services/api";
import type {
  MeUserProfile,
  PublicUserProfile,
  UpdateUserProfileRequest,
  UserSocialLinks,
  UserGenres,
  UserTracksResponse,
  UserFollowingResponse,
  UserFollowersResponse,
  FollowStatus,
  BlockedUsersResponse,
  SuggestedUsersResponse,
  MutualFriendsResponse,
} from "../../shared/types/User";

type SocialAccountsMap = {
  instagram?: string;
  youtube?: string;
  spotify?: string;
  tiktok?: string;
  soundcloud?: string;
  twitter?: string;
};

type RawSocialLink = {
  platform?: string | null;
  url?: string | null;
};

function normalizeSocialLinksResponse(payload: unknown): SocialAccountsMap {
  const map: SocialAccountsMap = {};

  const rawLinks: RawSocialLink[] = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { links?: unknown })?.links)
      ? ((payload as { links: RawSocialLink[] }).links ?? [])
      : [];

  rawLinks.forEach((item) => {
    const platform = (item?.platform ?? "").toUpperCase();
    const url = item?.url?.trim();
    if (!url) return;

    if (platform === "INSTAGRAM") map.instagram = url;
    if (platform === "YOUTUBE") map.youtube = url;
    if (platform === "SPOTIFY") map.spotify = url;
    if (platform === "TIKTOK") map.tiktok = url;
    if (platform === "SOUNDCLOUD") map.soundcloud = url;
    if (platform === "TWITTER") map.twitter = url;
  });

  return map;
}

type FallbackRequest = {
  method: "post" | "delete";
  url: string;
};

async function requestWithFallback(requests: FallbackRequest[]): Promise<void> {
  let lastError: unknown;

  for (const req of requests) {
    try {
      await api.request({ method: req.method, url: req.url });
      return;
    } catch (error: any) {
      lastError = error;
      const status = error?.response?.status;
      if (status !== 404 && status !== 405) {
        throw error;
      }
    }
  }

  throw lastError;
}

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

  async getMeSocialLinks(): Promise<SocialAccountsMap> {
    const { data } = await api.get<UserSocialLinks | RawSocialLink[]>(
      "/users/me/social-links",
    );
    return normalizeSocialLinksResponse(data);
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
    const { data } = await api.patch<UserGenres>("/users/me/genres", payload);
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

  async getUserFollowers(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<UserFollowersResponse> {
    const { data } = await api.get<UserFollowersResponse>(
      `/users/${encodeURIComponent(userId)}/followers?page=${page}&limit=${limit}`,
    );
    return data;
  },

  async getMutualFriends(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<MutualFriendsResponse> {
    const { data } = await api.get<MutualFriendsResponse>(
      `/users/${encodeURIComponent(userId)}/mutual-friends?page=${page}&limit=${limit}`,
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
    await requestWithFallback([
      { method: "post", url: `/users/${encodedId}/follow` },
      { method: "post", url: `/users/${encodedId}/followers` },
    ]);
  },

  async unfollowUser(userId: string): Promise<void> {
    const encodedId = encodeURIComponent(userId);
    await requestWithFallback([
      { method: "delete", url: `/users/${encodedId}/follow` },
      { method: "delete", url: `/users/${encodedId}/followers` },
    ]);
  },

  async getBlockedUsers(page = 1, limit = 20): Promise<BlockedUsersResponse> {
    const { data } = await api.get<BlockedUsersResponse>(
      `/users/me/blocked-users?page=${page}&limit=${limit}`,
    );
    return data;
  },

  async blockUser(userId: string): Promise<void> {
    const encodedId = encodeURIComponent(userId);
    await requestWithFallback([
      { method: "post", url: `/users/${encodedId}/block` },
      { method: "post", url: `/users/${encodedId}/blocked` },
    ]);
  },

  async unblockUser(userId: string): Promise<void> {
    const encodedId = encodeURIComponent(userId);
    await requestWithFallback([
      { method: "delete", url: `/users/${encodedId}/block` },
      { method: "delete", url: `/users/${encodedId}/blocked` },
    ]);
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

  async removeMeSocialLink(platform: string): Promise<void> {
    await api.delete(`/users/me/social-links/${platform.toLowerCase()}`);
  },
};
