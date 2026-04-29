import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import FollowersPage from "../pages/FollowersPage";
import { followingService } from "../followingService";
import { profileService } from "../../profile/profileService";
import { useMe } from "../../profile/context/useMe";
import type {
  MeUserProfile,
  PublicUserProfile,
  UserFollowersResponse,
} from "../../../shared/types/User";

const mockUseMe = vi.hoisted(() => vi.fn());

vi.mock("../../profile/context/useMe", () => ({
  useMe: mockUseMe,
}));

vi.mock("../followingService", () => ({
  followingService: {
    getUserFollowers: vi.fn(),
    followUser: vi.fn(),
    unfollowUser: vi.fn(),
  },
}));

vi.mock("../../profile/profileService", () => ({
  profileService: {
    getPublicProfile: vi.fn(),
  },
}));

vi.mock("../components/UserGrid", () => ({
  default: ({
    users,
    renderAction,
  }: {
    users: Array<{ id: string; username: string }>;
    renderAction?: (user: { id: string; username: string }) => ReactNode;
  }) => (
    <div data-testid="user-grid">
      {users.map((user) => (
        <div key={user.id} data-testid={`user-row-${user.id}`}>
          <span>{user.username}</span>
          {renderAction?.(user)}
        </div>
      ))}
    </div>
  ),
}));

const mockedGetUserFollowers = vi.mocked(followingService.getUserFollowers);
const mockedFollowUser = vi.mocked(followingService.followUser);
const mockedUnfollowUser = vi.mocked(followingService.unfollowUser);
const mockedGetPublicProfile = vi.mocked(profileService.getPublicProfile);

const makeMe = (overrides: Partial<MeUserProfile> = {}): MeUserProfile => ({
  id: "user-1",
  username: "alice",
  displayName: "Alice Example",
  email: "alice@example.com",
  role: "LISTENER",
  bio: null,
  location: null,
  avatarUrl: "https://cdn.example.com/alice.jpg",
  coverUrl: null,
  isCertified: false,
  isActive: true,
  visibility: "PUBLIC",
  followersCount: 12,
  followingCount: 8,
  likesReceived: 0,
  createdAt: "2026-04-01T00:00:00.000Z",
  updatedAt: "2026-04-01T00:00:00.000Z",
  lastLogin: "2026-04-02T00:00:00.000Z",
  ...overrides,
});

const makePublicProfile = (
  overrides: Partial<PublicUserProfile> = {},
): PublicUserProfile => ({
  id: "artist-9",
  username: "dj_zen",
  displayName: "DJ Zen",
  role: "ARTIST",
  bio: null,
  location: null,
  avatarUrl: "https://cdn.example.com/dj-zen.jpg",
  coverUrl: null,
  followersCount: 999,
  followingCount: 42,
  tracksUploadedCount: 13,
  ...overrides,
});

const makeFollowersResponse = (
  followers: UserFollowersResponse["followers"],
): UserFollowersResponse => ({
  followers,
  pagination: { page: 1, limit: 20, total: followers.length, totalPages: 1 },
});

const renderFollowersPage = (username: string) =>
  render(
    <MemoryRouter initialEntries={[`/${username}/followers`]}>
      <Routes>
        <Route path="/:username/followers" element={<FollowersPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("FollowersPage", () => {
  it("shows loading while the followers request is pending", () => {
    mockUseMe.mockReturnValue({ me: makeMe() } as { me: MeUserProfile });
    mockedGetUserFollowers.mockReturnValue(new Promise(() => {}));

    renderFollowersPage("alice");

    expect(screen.getByTestId("followers-loading")).toHaveTextContent(
      "Loading followers...",
    );
    expect(mockedGetPublicProfile).not.toHaveBeenCalled();
    expect(mockedGetUserFollowers).toHaveBeenCalledWith("user-1");
  });

  it("renders the signed-in user's followers list and follow states", async () => {
    mockUseMe.mockReturnValue({ me: makeMe() } as { me: MeUserProfile });
    mockedGetUserFollowers.mockResolvedValue(
      makeFollowersResponse([
        { id: "user-1", username: "alice", avatarUrl: null, isFollowing: true },
        { id: "fan-2", username: "nightwave", avatarUrl: null, isFollowing: false },
        { id: "fan-3", username: "groovecat", avatarUrl: null, isFollowing: true },
      ]),
    );

    renderFollowersPage("alice");

    await waitFor(() => {
      expect(mockedGetUserFollowers).toHaveBeenCalledWith("user-1");
    });

    expect(screen.getByTestId("social-info-title")).toHaveTextContent(
      "Followers of Alice Example",
    );
    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("nightwave")).toBeInTheDocument();
    expect(screen.getByText("groovecat")).toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByTestId("follow-btn-fan-2")).toHaveTextContent("follow");
    expect(screen.getByTestId("follow-btn-fan-3")).toHaveTextContent(
      "following",
    );
  });

  it("loads a public profile before fetching followers for another user", async () => {
    mockUseMe.mockReturnValue({ me: null } as { me: null });
    mockedGetPublicProfile.mockResolvedValue(makePublicProfile());
    mockedGetUserFollowers.mockResolvedValue(
      makeFollowersResponse([
        { id: "fan-9", username: "listener_one", avatarUrl: null, isFollowing: false },
      ]),
    );

    renderFollowersPage("dj_zen");

    await waitFor(() => {
      expect(mockedGetPublicProfile).toHaveBeenCalledWith("dj_zen");
      expect(mockedGetUserFollowers).toHaveBeenCalledWith("artist-9");
    });

    expect(screen.getByTestId("social-info-title")).toHaveTextContent(
      "Followers of DJ Zen",
    );
    expect(screen.getByText("listener_one")).toBeInTheDocument();
    expect(screen.getByTestId("follow-btn-fan-9")).toHaveTextContent("follow");
  });

  it("calls follow and unfollow actions for follower buttons", async () => {
    mockUseMe.mockReturnValue({ me: makeMe() } as { me: MeUserProfile });
    mockedGetUserFollowers.mockResolvedValue(
      makeFollowersResponse([
        { id: "fan-1", username: "newlistener", avatarUrl: null, isFollowing: false },
        { id: "fan-2", username: "alreadythere", avatarUrl: null, isFollowing: true },
      ]),
    );
    mockedFollowUser.mockResolvedValue(undefined);
    mockedUnfollowUser.mockResolvedValue(undefined);

    renderFollowersPage("alice");

    await waitFor(() => {
      expect(screen.getByTestId("follow-btn-fan-1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("follow-btn-fan-1"));
    fireEvent.click(screen.getByTestId("follow-btn-fan-2"));

    await waitFor(() => {
      expect(mockedFollowUser).toHaveBeenCalledWith("fan-1");
      expect(mockedUnfollowUser).toHaveBeenCalledWith("fan-2");
    });
  });
});