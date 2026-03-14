import { api } from "../../services/api";
import type { User } from "../../shared/types/User";

const getUserFromResponse = (data: User | User[]) => {
	if (Array.isArray(data)) {
		return data[0] ?? null;
	}

	return data ?? null;
};

export const profileService = {
	async getCurrentUser(): Promise<User | null> {
		const { data } = await api.get<User | User[]>("/users");
		return getUserFromResponse(data);
	},
};
