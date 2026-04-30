import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserInfoBar from "../../../components/UserInfo/UserInfoBar";
import { MemoryRouter } from "react-router-dom";

const mockGetFollowStatus = vi.hoisted(() => vi.fn());
const mockGetBlockedUsers = vi.hoisted(() => vi.fn());
const mockBlockUser = vi.hoisted(() => vi.fn());
const mockUnblockUser = vi.hoisted(() => vi.fn());
const mockNotifySocialGraphUpdated = vi.hoisted(() => vi.fn());

vi.mock("../../../../following/followingService", () => ({
  followingService: {
    getFollowStatus: mockGetFollowStatus,
    getBlockedUsers: mockGetBlockedUsers,
    blockUser: mockBlockUser,
    unblockUser: mockUnblockUser,
  },
}));

vi.mock("../../../socialGraphEvents", () => ({
  notifySocialGraphUpdated: mockNotifySocialGraphUpdated,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockGetFollowStatus.mockResolvedValue({ isFollowing: false, isFollowedBy: false, isMutual: false });
  mockGetBlockedUsers.mockResolvedValue({
    page: 1,
    limit: 200,
    total: 1,
    hasMore: false,
    data: [
      {
        blockId: "block-1",
        blockedAt: "2026-04-29T18:59:17.094Z",
        user: {
          id: "user-1",
          username: "John",
          displayName: "John",
          avatarUrl: null,
        },
      },
    ],
  });
  mockBlockUser.mockResolvedValue(undefined);
  mockUnblockUser.mockResolvedValue(undefined);
});

describe("UserInfoBar", () => {
  it("renders all tabs", () => {
    render(
      <MemoryRouter>
        <UserInfoBar />
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
  });

  it("shows Edit button if editable", () => {
    render(
      <MemoryRouter>
        <UserInfoBar isMe displayName="John" />
      </MemoryRouter>,
    );
    expect(screen.getByText(/edit/i)).toBeInTheDocument();
  });

  it("opens EditInfo modal on Edit click", () => {
    render(
      <MemoryRouter>
        <UserInfoBar isMe displayName="John" />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText(/edit/i));
    expect(screen.getByText(/edit your profile/i)).toBeInTheDocument();
  });

  it("shows Unblock in the more menu when the viewed user is blocked", async () => {
    render(
      <MemoryRouter>
        <UserInfoBar isMe={false} displayName="John" userId="user-1" />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /more/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /unblock john/i })).toBeInTheDocument();
    });
  });

  it("calls unblock when the blocked user action is clicked", async () => {
    render(
      <MemoryRouter>
        <UserInfoBar isMe={false} displayName="John" userId="user-1" />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /more/i }));

    const unblockButton = await screen.findByRole("button", { name: /unblock john/i });
    fireEvent.click(unblockButton);

    await waitFor(() => {
      expect(mockUnblockUser).toHaveBeenCalledWith("user-1");
      expect(mockNotifySocialGraphUpdated).toHaveBeenCalled();
    });
  });
});
