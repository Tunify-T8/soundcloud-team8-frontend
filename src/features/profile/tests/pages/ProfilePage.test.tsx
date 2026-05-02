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

vi.mock("@/features/profile/context/useMe", () => ({
  useMe: () => ({
    me: {
      id: "me-1",
      username: "nada",
      displayName: "Nada",
      location: "Cairo, Egypt",
      isCertified: true,
      avatarUrl: "",
      coverUrl: "",
      followersCount: 10,
      followingCount: 5,
      role: "listener",
      bio: "My bio",
      visibility: "public",
    },
    socialAccounts: [],
    following: [],
    refresh: vi.fn(),
  }),
}));

vi.mock("@/hooks/usePlayContext", () => ({
  usePlayContext: vi.fn(),
}));

vi.mock("../../profileService", () => ({
  profileService: {
    getPublicProfile: (...args: unknown[]) => mockGetPublicProfile(...args),
    getUserFollowers: (...args: unknown[]) => mockGetUserFollowers(...args),
    getUserFollowing: (...args: unknown[]) => mockGetUserFollowing(...args),
  },
}));

vi.mock("../../components/Header/Header", () => ({
  default: ({ username }: { username: string }) => <div data-testid="profile-header">{username}</div>,
}));

vi.mock("../../components/UserInfo/UserInfoBar", () => ({
  default: ({ username }: { username: string }) => <div data-testid="user-info-bar">{username}</div>,
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
    mockGetPublicProfile.mockReset();
    mockGetUserFollowers.mockReset();
    mockGetUserFollowing.mockReset();
    mockGetUserFollowers.mockResolvedValue({ followers: [] });
    mockGetUserFollowing.mockResolvedValue({ following: [] });
  });

  it("renders the signed-in user's profile when no username param is present", () => {
    renderProfilePage("/me");

    expect(screen.getByTestId("profile-header")).toHaveTextContent("nada");
    expect(screen.getAllByTestId("profile-sidebar")).toHaveLength(2);
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

    expect(await screen.findByTestId("profile-header")).toHaveTextContent("alice");
    expect(mockGetPublicProfile).toHaveBeenCalledWith("alice");
  });
});
