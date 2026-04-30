import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import WhoToFollowPage from "../pages/WhoToFollowPage";
import { followingService } from "../followingService";
import { notifySocialGraphUpdated } from "../../profile/socialGraphEvents";

vi.mock("../followingService", () => ({
  followingService: {
    getSuggestedUsers: vi.fn(),
    followUser: vi.fn(),
  },
}));

vi.mock("../../profile/socialGraphEvents", () => ({
  notifySocialGraphUpdated: vi.fn(),
}));

vi.mock("../components/UserCard", () => ({
  default: ({ id, username, action }: { id: string; username: string; action?: React.ReactNode }) => (
    <div data-testid={`user-card-${id}`}>
      <span>{username}</span>
      {action}
    </div>
  ),
}));

const mockedGetSuggestedUsers = vi.mocked(followingService.getSuggestedUsers);
const mockedFollowUser = vi.mocked(followingService.followUser);
const mockedNotify = vi.mocked(notifySocialGraphUpdated);

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("WhoToFollowPage", () => {
  it("shows loading while suggestions are pending", () => {
    mockedGetSuggestedUsers.mockReturnValue(new Promise(() => {}));

    render(<WhoToFollowPage />);

    expect(screen.getByText("Loading suggestions...")).toBeInTheDocument();
  });

  it("renders suggestions and removes a user after following", async () => {
    mockedGetSuggestedUsers.mockResolvedValue({
      page: 1,
      limit: 10,
      total: 2,
      users: [
        { id: "user-1", username: "wavequeen", avatarUrl: null, coverUrl: null, role: "ARTIST", mutualFollowersCount: 2, tracksUploadedCount: 7, followersCount: 101, followingCount: 5 },
        { id: "user-2", username: "bassline", avatarUrl: null, coverUrl: null, role: "LISTENER", mutualFollowersCount: 0, tracksUploadedCount: 0, followersCount: 12, followingCount: 3 },
      ],
    });
    mockedFollowUser.mockResolvedValue(undefined);

    render(<WhoToFollowPage />);

    await waitFor(() => {
      expect(screen.getByText("Who to follow")).toBeInTheDocument();
    });

    expect(screen.getByText("wavequeen")).toBeInTheDocument();
    expect(screen.getByText("bassline")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Follow" })[0]);

    await waitFor(() => {
      expect(mockedFollowUser).toHaveBeenCalledWith("user-1");
      expect(mockedNotify).toHaveBeenCalledTimes(1);
      expect(screen.queryByText("wavequeen")).not.toBeInTheDocument();
    });
  });

  it("shows empty state when no suggestions are available", async () => {
    mockedGetSuggestedUsers.mockResolvedValue({ page: 1, limit: 10, total: 0, users: [] });

    render(<WhoToFollowPage />);

    await waitFor(() => {
      expect(screen.getByText("No suggestions available right now.")).toBeInTheDocument();
    });
  });
});