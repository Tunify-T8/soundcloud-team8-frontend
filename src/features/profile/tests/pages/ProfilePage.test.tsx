import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import ProfilePage from "../../pages/ProfilePage";
import audioSourceReducer from "@/store/AudioSourceSlice";
import userReducer from "@/store/userSlice";
import queueReducer from "@/store/queueSlice";
import playContextReducer from "@/store/playContextSlice";

const mockGetPublicProfile = vi.fn();
const mockGetUserFollowers = vi.fn();
const mockGetUserFollowing = vi.fn();
const mockUsePlayContext = vi.fn();
const mockRefresh = vi.fn();

const mockMe = {
  id: "me-1",
  username: "nada",
  displayName: "Nada",
  location: "Cairo, Egypt",
  isCertified: true,
  avatarUrl: "",
  coverUrl: "",
  followersCount: 10,
  followingCount: 5,
  role: "listener" as const,
  bio: "My bio",
  visibility: "public",
};

const mockSocialAccounts: [] = [];
const mockFollowing: [] = [];

vi.mock("../../context/useMe", () => ({
  useMe: () => ({
    me: mockMe,
    socialAccounts: mockSocialAccounts,
    following: mockFollowing,
    refresh: mockRefresh,
  }),
}));

vi.mock("@/hooks/usePlayContext", () => ({
  usePlayContext: (...args: unknown[]) => mockUsePlayContext(...args),
}));

vi.mock("../../profileService", () => ({
  profileService: {
    getPublicProfile: (...args: unknown[]) => mockGetPublicProfile(...args),
    getUserFollowers: (...args: unknown[]) => mockGetUserFollowers(...args),
    getUserFollowing: (...args: unknown[]) => mockGetUserFollowing(...args),
  },
}));

vi.mock("../../components/Header/Header", () => ({
  default: ({ username }: { username: string }) => (
    <div data-testid="profile-header">{username}</div>
  ),
}));

vi.mock("../../components/UserInfo/UserInfoBar", () => ({
  default: ({
    username,
    isMe,
  }: {
    username: string;
    isMe?: boolean;
  }) => <div data-testid="user-info-bar">{`${username}-${String(isMe)}`}</div>,
}));

vi.mock("../../components/UserInfo/ProfileSideBar", () => ({
  default: () => <div data-testid="profile-sidebar">Sidebar</div>,
}));

describe("ProfilePage", () => {
  function renderProfilePage(initialEntry = "/me") {
    const store = configureStore({
      reducer: {
        audioSource: audioSourceReducer,
        user: userReducer,
        queue: queueReducer,
        playContext: playContextReducer,
      },
    });

    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/me" element={<ProfilePage />} />
            <Route path="/:username" element={<ProfilePage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserFollowers.mockResolvedValue({ followers: [] });
    mockGetUserFollowing.mockResolvedValue({ following: [] });
  });

  it("renders the signed-in user's profile when no username param is present", async () => {
    renderProfilePage("/me");

    expect(screen.getByTestId("profile-header")).toHaveTextContent("nada");
    expect(screen.getByTestId("user-info-bar")).toHaveTextContent("nada-true");
    expect(screen.getAllByTestId("profile-sidebar")).toHaveLength(2);
    expect(mockGetUserFollowers).toHaveBeenCalledWith("me-1");
    expect(mockUsePlayContext).toHaveBeenCalledWith({
      contextType: "profile",
      contextId: "me-1",
    });
  });

  it("renders a public profile when a username route is provided", async () => {
    mockGetPublicProfile.mockResolvedValue({
      id: "user-2",
      username: "alice",
      displayName: "Alice",
      location: "Paris, France",
      isCertified: false,
      avatarUrl: "",
      coverUrl: "",
      followersCount: 12,
      followingCount: 2,
      role: "listener",
      bio: "Public profile",
    });

    renderProfilePage("/alice");

    expect(await screen.findByTestId("profile-header")).toHaveTextContent(
      "alice",
    );
    expect(screen.getByTestId("user-info-bar")).toHaveTextContent("alice-false");
    expect(mockGetPublicProfile).toHaveBeenCalledWith("alice");
    expect(mockGetUserFollowers).toHaveBeenCalledWith("user-2");
    expect(mockGetUserFollowing).toHaveBeenCalledWith("user-2");
    expect(mockUsePlayContext).toHaveBeenCalledWith({
      contextType: "profile",
      contextId: "user-2",
    });
  });

  it("renders an error state when loading a public profile fails", async () => {
    mockGetPublicProfile.mockRejectedValue(new Error("Failed to fetch user"));

    renderProfilePage("/ghost");

    expect(await screen.findByTestId("profile-page-error")).toHaveTextContent(
      "Failed to fetch user",
    );
  });
});
