import { api } from "../../services/api";
import type { FollowingUser, User } from "../../shared/types/User";

type UsersResponse = User | User[] | { users?: User[]; data?: User[] };
type FollowingApiResponse = FollowingUser[] | { following?: FollowingUser[] };
type UserWithFollowing = User & { following?: FollowingApiResponse };

const normalizeUsername = (value: string) =>
  decodeURIComponent(value).trim().replace(/^@/, "").toLowerCase();

const toUsersArray = (payload: UsersResponse): User[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    if ("username" in payload) {
      return [payload as User];
    }

    if (Array.isArray(payload.users)) {
      return payload.users;
    }

    if (Array.isArray(payload.data)) {
      return payload.data;
    }
  }

  return [];
};

const findUserByUsername = (users: User[], username: string): User | null => {
  const target = normalizeUsername(username);
  return (
    users.find((user) => normalizeUsername(user.username) === target) ?? null
  );
};

export const profileService = {
  async getCurrentUser(): Promise<User | null> {
    const { data } = await api.get<User>("/my-profile");
    return data ?? null;
  },

  async getUserByUsername(username: string): Promise<User | null> {
    const target = username.trim().replace(/^@/, "");

    try {
      const { data } = await api.get<UsersResponse>(
        `/users?username=${encodeURIComponent(target)}`,
      );
      const matchedUser = findUserByUsername(toUsersArray(data), target);
      if (matchedUser) {
        return matchedUser;
      }
    } catch {}

    try {
      const { data } = await api.get<UsersResponse>(
        `/users/${encodeURIComponent(target)}`,
      );
      const directUser = findUserByUsername(toUsersArray(data), target);
      if (directUser) {
        return directUser;
      }
    } catch {}

    const { data } = await api.get<UsersResponse>("/users");
    return findUserByUsername(toUsersArray(data), target);
  },

  async getFollowing(
    username: string,
    page = 1,
    limit = 20,
  ): Promise<FollowingUser[]> {
    const target = username.trim().replace(/^@/, "");

    try {
      const { data } = await api.get<FollowingApiResponse>(
        `/users/${encodeURIComponent(target)}/following`,
        {
          params: { page, limit },
        },
      );

      if (Array.isArray(data)) {
        return data;
      }

      if (data && Array.isArray(data.following)) {
        return data.following;
      }
    } catch {}

    try {
      const { data } = await api.get<UsersResponse>(
        `/users?username=${encodeURIComponent(target)}`,
      );
      const matchedUser = findUserByUsername(
        toUsersArray(data),
        target,
      ) as UserWithFollowing | null;

      if (!matchedUser?.following) {
        return [];
      }

      if (Array.isArray(matchedUser.following)) {
        return matchedUser.following;
      }

      if (Array.isArray(matchedUser.following.following)) {
        return matchedUser.following.following;
      }
    } catch {}

    return [];
  },
};
