import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import WhoToFollowPage from "../pages/WhoToFollowPage";
import { followingService } from "../followingService";
import { feedService } from "@/features/feed/feedservice";
import { notifySocialGraphUpdated } from "../../profile/socialGraphEvents";

vi.mock("../followingService", () => ({
  followingService: {
    followUser: vi.fn(),
  },
}));

vi.mock("@/features/feed/feedservice", () => ({
  feedService: {
    getSuggestedArtists: vi.fn(),
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

const mockedGetSuggestedArtists = vi.mocked(feedService.getSuggestedArtists);
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
    mockedGetSuggestedArtists.mockReturnValue(new Promise(() => {}));

    render(<WhoToFollowPage />);

    expect(screen.getByText("Loading suggestions...")).toBeInTheDocument();
  });

  it("renders suggestions and removes a user after following", async () => {
    mockedGetSuggestedArtists.mockResolvedValue([
      { id: "user-1", username: "wavequeen", avatarUrl: null, displayName: null, followersCount: 101, isCertified: false, isFollowing: false },
      { id: "user-2", username: "bassline", avatarUrl: null, displayName: null, followersCount: 12, isCertified: false, isFollowing: false },
    ]);
    mockedFollowUser.mockResolvedValue(undefined);

    render(<WhoToFollowPage />);

    await waitFor(() => {
      expect(screen.getByText("Who to follow")).toBeInTheDocument();
    });

    expect(screen.getByText("wavequeen")).toBeInTheDocument();
    expect(screen.getByText("bassline")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "follow" })[0]);

    await waitFor(() => {
      expect(mockedFollowUser).toHaveBeenCalledWith("user-1");
      expect(mockedNotify).toHaveBeenCalledTimes(1);
      expect(screen.queryByText("wavequeen")).not.toBeInTheDocument();
    });
  });

  it("shows empty state when no suggestions are available", async () => {
    mockedGetSuggestedArtists.mockResolvedValue([]);

    render(<WhoToFollowPage />);

    await waitFor(() => {
      expect(screen.getByText("No suggestions available right now.")).toBeInTheDocument();
    });
  });
});
