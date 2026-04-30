import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import FollowingPage from "../pages/FollowingPage";
import { followingService } from "../followingService";
import { profileService } from "../../profile/profileService";
import { useMe } from "../../profile/context/useMe";
import type { MeUserProfile, PublicUserProfile, UserFollowingResponse } from "../../../shared/types/User";

const mockUseMe = vi.hoisted(() => vi.fn());

vi.mock("../../profile/context/useMe", () => ({
  useMe: mockUseMe,
}));

vi.mock("../followingService", () => ({
  followingService: {
    getUserFollowing: vi.fn(),
    getFollowStatus: vi.fn(),
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

const mockedGetUserFollowing = vi.mocked(followingService.getUserFollowing);
const mockedGetFollowStatus = vi.mocked(followingService.getFollowStatus);
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

const makeFollowingResponse = (
  following: UserFollowingResponse["following"],
): UserFollowingResponse => ({
  following,
  page: 1,
  limit: 20,
  hasMore: false,
});

const renderFollowingPage = (username: string) =>
  render(
    <MemoryRouter initialEntries={[`/${username}/following`]}>
      <Routes>
        <Route path="/:username/following" element={<FollowingPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("FollowingPage", () => {
  it("redirects the me route to the signed-in user's following page", () => {
    mockUseMe.mockReturnValue({ me: makeMe() } as { me: MeUserProfile });

    render(
      <MemoryRouter initialEntries={[`/me/following`]}>
        <Routes>
          <Route path="/alice/following" element={<div data-testid="navigated" />} />
          <Route path="/:username/following" element={<FollowingPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("navigated")).toBeInTheDocument();
  });

  it("renders loading and loads the signed-in user's following list", async () => {
    mockUseMe.mockReturnValue({ me: makeMe() } as { me: MeUserProfile });
    mockedGetUserFollowing.mockResolvedValue(
      makeFollowingResponse([
        { id: "user-1", username: "alice", avatarUrl: null, followersCount: 10 },
        { id: "fan-2", username: "nightwave", avatarUrl: null, followersCount: 3 },
      ]),
    );

    renderFollowingPage("alice");

    expect(screen.getByTestId("following-loading")).toHaveTextContent("Loading following...");

    await waitFor(() => {
      expect(mockedGetUserFollowing).toHaveBeenCalledWith("user-1");
    });

    expect(screen.getByTestId("social-info-title")).toHaveTextContent("Alice Example is following");
    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("nightwave")).toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByTestId("follow-toggle-btn-fan-2")).toHaveTextContent("follow");
  });

  it("loads a public profile and follow states for another user's following list", async () => {
    mockUseMe.mockReturnValue({ me: makeMe() } as { me: MeUserProfile });
    mockedGetPublicProfile.mockResolvedValue(makePublicProfile());
    mockedGetUserFollowing.mockResolvedValue(
      makeFollowingResponse([
        { id: "fan-9", username: "listener_one", avatarUrl: null, followersCount: 1 },
        { id: "user-1", username: "alice", avatarUrl: null, followersCount: 10 },
      ]),
    );
    mockedGetFollowStatus.mockResolvedValue({ isFollowing: true, isFollowedBy: false, isMutual: false });

    renderFollowingPage("dj_zen");

    await waitFor(() => {
      expect(mockedGetPublicProfile).toHaveBeenCalledWith("dj_zen");
      expect(mockedGetUserFollowing).toHaveBeenCalledWith("artist-9");
    });

    expect(screen.getByTestId("social-info-title")).toHaveTextContent("DJ Zen is following");
    expect(screen.getByText("listener_one")).toBeInTheDocument();
    expect(screen.getByTestId("follow-toggle-btn-fan-9")).toHaveTextContent("following");
  });

  it("toggles follow state from the action button", async () => {
    mockUseMe.mockReturnValue({ me: makeMe() } as { me: MeUserProfile });
    mockedGetUserFollowing.mockResolvedValue(
      makeFollowingResponse([
        { id: "fan-2", username: "nightwave", avatarUrl: null, followersCount: 3 },
      ]),
    );
    mockedFollowUser.mockResolvedValue(undefined);

    renderFollowingPage("alice");

    await waitFor(() => {
      expect(screen.getByTestId("follow-toggle-btn-fan-2")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("follow-toggle-btn-fan-2"));

    await waitFor(() => {
      expect(mockedUnfollowUser).toHaveBeenCalledWith("fan-2");
    });
  });
});