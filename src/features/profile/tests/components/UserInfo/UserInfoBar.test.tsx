import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import UserInfoBar from "../../../components/UserInfo/UserInfoBar";
import userReducer from "@/store/userSlice";

const mockGetFollowStatus = vi.hoisted(() => vi.fn());
const mockFollowUser = vi.hoisted(() => vi.fn());
const mockUnfollowUser = vi.hoisted(() => vi.fn());
const mockNotifySocialGraphUpdated = vi.hoisted(() => vi.fn());
const mockCreateOrGetConversation = vi.hoisted(() => vi.fn());
const mockConversationBlockUser = vi.hoisted(() => vi.fn());
const mockConversationUnblockUser = vi.hoisted(() => vi.fn());

vi.mock("../../../../following/followingService", () => ({
  followingService: {
    getFollowStatus: mockGetFollowStatus,
    followUser: mockFollowUser,
    unfollowUser: mockUnfollowUser,
  },
}));

vi.mock("../../../socialGraphEvents", () => ({
  notifySocialGraphUpdated: mockNotifySocialGraphUpdated,
}));

vi.mock("@/features/conversation/conversationService", () => ({
  conversationService: {
    createOrGetConversation: mockCreateOrGetConversation,
    blockUser: mockConversationBlockUser,
    unblockUser: mockConversationUnblockUser,
  },
}));

vi.mock("@/features/reports/components/ReportModal", () => ({
  default: ({ entityType, entityId }: { entityType: string; entityId: string }) => (
    <div data-testid="report-modal">{`${entityType}-${entityId}`}</div>
  ),
}));

function renderWithStore(
  element: React.ReactElement,
  currentUserRole: string | null = null,
) {
  const store = configureStore({
    reducer: {
      user: userReducer,
    },
  });

  if (currentUserRole) {
    store.dispatch({
      type: "user/setUser",
      payload: {
        id: "me-1",
        username: "admin",
        displayName: "Admin",
        email: "admin@test.com",
        role: currentUserRole,
        isVerified: true,
        avatarUrl: null,
      },
    });
  }

  return render(<Provider store={store}>{element}</Provider>);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetFollowStatus.mockResolvedValue({
    isFollowing: false,
    isBlocked: false,
  });
  mockFollowUser.mockResolvedValue(undefined);
  mockUnfollowUser.mockResolvedValue(undefined);
  mockCreateOrGetConversation.mockResolvedValue("conv-1");
  mockConversationBlockUser.mockResolvedValue(undefined);
  mockConversationUnblockUser.mockResolvedValue(undefined);
});

describe("UserInfoBar", () => {
  it("renders the profile tabs and edit action for the current user", () => {
    renderWithStore(
      <MemoryRouter initialEntries={["/me"]}>
        <Routes>
          <Route
            path="/me/*"
            element={<UserInfoBar isMe displayName="John" userId="me-1" />}
          />
        </Routes>
      </MemoryRouter>,
    );

    [
      "All",
      "Popular tracks",
      "Tracks",
      "Albums",
      "Playlists",
      "Reposts",
    ].forEach((tab) => {
      expect(screen.getByText(tab)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("opens the edit profile overlay for the current user", () => {
    renderWithStore(
      <MemoryRouter initialEntries={["/me"]}>
        <Routes>
          <Route
            path="/me/*"
            element={<UserInfoBar isMe displayName="John" userId="me-1" />}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    expect(screen.getByText(/edit your profile/i)).toBeInTheDocument();
  });

  it("follows a viewed profile from the follow button", async () => {
    renderWithStore(
      <MemoryRouter initialEntries={["/john"]}>
        <Routes>
          <Route
            path="/:username/*"
            element={<UserInfoBar displayName="John" userId="user-1" />}
          />
        </Routes>
      </MemoryRouter>,
    );

    const followButton = await screen.findByRole("button", { name: /follow/i });
    fireEvent.click(followButton);

    await waitFor(() => {
      expect(mockFollowUser).toHaveBeenCalledWith("user-1");
      expect(mockNotifySocialGraphUpdated).toHaveBeenCalled();
      expect(screen.getByRole("button", { name: /following/i })).toBeInTheDocument();
    });
  });

  it("opens the more-actions menu and blocks the viewed profile", async () => {
    renderWithStore(
      <MemoryRouter initialEntries={["/john"]}>
        <Routes>
          <Route
            path="/:username/*"
            element={<UserInfoBar displayName="John" username="john" userId="user-1" />}
          />
        </Routes>
      </MemoryRouter>,
      "admin",
    );

    fireEvent.click(screen.getByTestId("profile-more-actions-btn"));

    const blockButton = await screen.findByRole("button", {
      name: /block john/i,
    });
    fireEvent.click(blockButton);
    fireEvent.click(await screen.findByRole("button", { name: /block john/i }));

    await waitFor(() => {
      expect(mockCreateOrGetConversation).toHaveBeenCalledWith("user-1");
      expect(mockConversationBlockUser).toHaveBeenCalledWith("conv-1", false, false);
      expect(mockNotifySocialGraphUpdated).toHaveBeenCalled();
    });
  });

  it("opens the report modal from the more-actions menu", async () => {
    renderWithStore(
      <MemoryRouter initialEntries={["/john"]}>
        <Routes>
          <Route
            path="/:username/*"
            element={<UserInfoBar displayName="John" username="john" userId="user-1" />}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("profile-more-actions-btn"));
    fireEvent.click(await screen.findByRole("button", { name: /report john/i }));

    expect(await screen.findByTestId("report-modal")).toHaveTextContent("USER-user-1");
  });
});
