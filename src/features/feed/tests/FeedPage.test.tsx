import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FeedPage from "../pages/FeedPage";
import { feedService } from "../feedservice";
import { Genre } from "@/shared/types/Genre";
import type { FeedItem, FeedResponse } from "@/shared/types/Feed";

vi.mock("../feedservice", () => ({
  feedService: {
    getFeed: vi.fn(),
  },
}));

vi.mock("../../../components/layout/Sidebar", () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock("../../../components/ui/SongCard", () => ({
  default: ({ title, artistName }: { title: string; artistName: string }) => (
    <div data-testid="song-card">
      {artistName} - {title}
    </div>
  ),
}));

const mockedGetFeed = vi.mocked(feedService.getFeed);

const makeFeedItem = (overrides: Partial<FeedItem> = {}): FeedItem => ({
  id: "track-1",
  action: {
    username: "dj_zen",
    displayName: "DJ Zen",
    action: "post",
    userAvatarUrl: null,
    date: "2026-04-06T10:00:00.000Z",
  },
  title: "Morning Waves",
  artist: "DJ Zen",
  genre: Genre.POP,
  durationInSeconds: 180,
  coverUrl: null,
  waveformUrl: null,
  numberOfComments: 2,
  numberOfLikes: 15,
  numberOfListens: 120,
  numberOfReposts: 3,
  isLiked: false,
  isReposted: false,
  ...overrides,
});

const makeFeedResponse = (items: FeedItem[]): FeedResponse => ({
  items,
  page: 1,
  limit: 20,
  hasMore: false,
});

describe("FeedPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows loading state while feed request is pending", () => {
    mockedGetFeed.mockReturnValue(new Promise(() => {}));

    render(<FeedPage />);

    expect(screen.getByText("Loading feed...")).toBeInTheDocument();
  });

  it("loads and renders feed cards", async () => {
    mockedGetFeed.mockResolvedValue(
      makeFeedResponse([
        makeFeedItem({ id: "track-1", title: "Morning Waves", artist: "DJ Zen" }),
        makeFeedItem({ id: "track-2", title: "Night Drive", artist: "Lina", action: { username: "lina", displayName: "Lina", action: "repost", userAvatarUrl: null, date: "2026-04-05T10:00:00.000Z" } }),
      ])
    );

    render(<FeedPage />);

    await waitFor(() => {
      expect(mockedGetFeed).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText("Hear the latest posts from the people you're following:")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getAllByTestId("song-card")).toHaveLength(2);
    expect(screen.getByText("DJ Zen - Morning Waves")).toBeInTheDocument();
    expect(screen.getByText("Lina - Night Drive")).toBeInTheDocument();
  });

  it("filters reposts when the repost toggle is turned off", async () => {
    mockedGetFeed.mockResolvedValue(
      makeFeedResponse([
        makeFeedItem({
          id: "track-post",
          title: "Original Post",
          action: {
            username: "nova",
            displayName: "Nova",
            action: "post",
            userAvatarUrl: null,
            date: "2026-04-06T08:00:00.000Z",
          },
        }),
        makeFeedItem({
          id: "track-repost",
          title: "Shared Anthem",
          action: {
            username: "echo",
            displayName: "Echo",
            action: "repost",
            userAvatarUrl: null,
            date: "2026-04-05T08:00:00.000Z",
          },
        }),
      ])
    );

    render(<FeedPage />);

    await waitFor(() => {
      expect(screen.getByText(/Original Post/i)).toBeInTheDocument();
      expect(screen.getByText(/Shared Anthem/i)).toBeInTheDocument();
    });

    const repostToggle = screen.getByRole("button", { pressed: true });
    fireEvent.click(repostToggle);

    await waitFor(() => {
      expect(screen.getByText(/Original Post/i)).toBeInTheDocument();
      expect(screen.queryByText(/Shared Anthem/i)).not.toBeInTheDocument();
    });
  });

  it("shows empty state when feed has no items", async () => {
    mockedGetFeed.mockResolvedValue(makeFeedResponse([]));

    render(<FeedPage />);

    await waitFor(() => {
      expect(screen.getByText("Nothing to show here yet.")).toBeInTheDocument();
    });
  });

  it("shows empty state when service returns null", async () => {
    mockedGetFeed.mockResolvedValue(null);

    render(<FeedPage />);

    await waitFor(() => {
      expect(screen.getByText("Nothing to show here yet.")).toBeInTheDocument();
    });
  });

  it("shows error state when service rejects", async () => {
    mockedGetFeed.mockRejectedValue(new Error("network down"));

    render(<FeedPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load feed")).toBeInTheDocument();
    });
  });
});
