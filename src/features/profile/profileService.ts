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

  async removeMeSocialLink(platform: string): Promise<void> {
    await api.delete(`/users/me/social-links/${platform.toLowerCase()}`);
  },
};
