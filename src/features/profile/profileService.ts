import { api } from "../../services/api";
import type { User } from "../../shared/types/User";

type UsersResponse = User | User[] | { users?: User[]; data?: User[] };

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

    // TODO: Remove fallback logic when mock API matches backend contract (single User from /users/:userIdOrUsername).
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
};
