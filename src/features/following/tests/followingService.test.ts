import { describe, expect, it, vi, beforeEach } from "vitest";
import { followingService } from "../followingService";
import { api } from "../../auth/services/api";

vi.mock("../../auth/services/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("followingService", () => {
  it("fetches following, followers, status, and suggestions from the expected endpoints", async () => {
    mockedApi.get
      .mockResolvedValueOnce({ data: { page: 2, limit: 10, hasMore: false, following: [] } })
      .mockResolvedValueOnce({ data: { followers: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } } })
      .mockResolvedValueOnce({ data: { isFollowing: true, isFollowedBy: false, isMutual: false } })
      .mockResolvedValueOnce({ data: { page: 1, limit: 10, total: 0, users: [] } });

    await expect(followingService.getMeFollowing(2, 10)).resolves.toEqual({ page: 2, limit: 10, hasMore: false, following: [] });
    await expect(followingService.getUserFollowers("alice", 1, 20)).resolves.toEqual({ followers: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
    await expect(followingService.getFollowStatus("user-9")).resolves.toEqual({ isFollowing: true, isFollowedBy: false, isMutual: false });
    await expect(followingService.getSuggestedUsers()).resolves.toEqual({ page: 1, limit: 10, total: 0, users: [] });

    expect(mockedApi.get).toHaveBeenNthCalledWith(1, "/users/me/following?page=2&limit=10");
    expect(mockedApi.get).toHaveBeenNthCalledWith(2, "/users/alice/followers?page=1&limit=20");
    expect(mockedApi.get).toHaveBeenNthCalledWith(3, "/users/user-9/follow-status");
    expect(mockedApi.get).toHaveBeenNthCalledWith(4, "/users/me/suggested?page=1&limit=10");
  });

  it("uses the expected mutation endpoints for follow graph actions", async () => {
    mockedApi.post.mockResolvedValue({});
    mockedApi.delete.mockResolvedValue({});

    await followingService.followUser("user/1");
    await followingService.unfollowUser("user/1");
    await followingService.blockUser("user/1");
    await followingService.unblockUser("user/1");

    expect(mockedApi.post).toHaveBeenNthCalledWith(1, "/users/user%2F1/follow");
    expect(mockedApi.delete).toHaveBeenNthCalledWith(1, "/users/user%2F1/unfollow");
    expect(mockedApi.post).toHaveBeenNthCalledWith(2, "/users/user%2F1/block");
    expect(mockedApi.delete).toHaveBeenNthCalledWith(2, "/users/user%2F1/unblock");
  });
});