import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TrackRow from "../components/TrackRow";
import type { TrackItem } from "../types";

// Mock SongCard since TrackRow delegates the list view to it
vi.mock("@/components/ui/SongCard", () => ({
  default: vi.fn(
    ({
      title,
      artistName,
      coverUrl,
      timeAgo,
      likes,
      reposts,
      plays,
      comments,
    }) => (
      <div data-testid="song-card">
        <span data-testid="sc-title">{title}</span>
        <span data-testid="sc-artist">{artistName}</span>
        <span data-testid="sc-cover">{coverUrl}</span>
        <span data-testid="sc-timeago">{timeAgo}</span>
        <span data-testid="sc-likes">{likes}</span>
        <span data-testid="sc-reposts">{reposts}</span>
        <span data-testid="sc-plays">{plays}</span>
        <span data-testid="sc-comments">{comments}</span>
      </div>
    ),
  ),
}));

const mockTrack: TrackItem = {
  id: "track-1",
  title: "Sunset Drive",
  artist: "Lo-Fi Artist",
  coverUrl: "https://example.com/track.png",
  timeAgo: "2 hours ago",
  likes: "42",
  reposts: "10",
  plays: "3.2K",
  comments: "5",
};

describe("TrackRow – grid view", () => {
  it("renders the track title", () => {
    render(<TrackRow track={mockTrack} view="grid" />);
    expect(screen.getByText("Sunset Drive")).toBeInTheDocument();
  });

  it("renders the artist name", () => {
    render(<TrackRow track={mockTrack} view="grid" />);
    expect(screen.getByText("Lo-Fi Artist")).toBeInTheDocument();
  });

  it("renders the cover image when coverUrl is provided", () => {
    render(<TrackRow track={mockTrack} view="grid" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/track.png");
    expect(img).toHaveAttribute("alt", "Sunset Drive");
  });

  it("does not render an image when coverUrl is absent", () => {
    const { coverUrl: _, ...trackWithoutCover } = mockTrack;
    render(<TrackRow track={trackWithoutCover} view="grid" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders the heart (liked) icon in grid view", () => {
    const { container } = render(<TrackRow track={mockTrack} view="grid" />);
    // lucide Heart renders as an SVG
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("does not render a SongCard in grid view", () => {
    render(<TrackRow track={mockTrack} view="grid" />);
    expect(screen.queryByTestId("song-card")).not.toBeInTheDocument();
  });
});

describe("TrackRow – list view (default)", () => {
  it("renders a SongCard by default", () => {
    render(<TrackRow track={mockTrack} />);
    expect(screen.getByTestId("song-card")).toBeInTheDocument();
  });

  it("renders a SongCard when view is explicitly 'list'", () => {
    render(<TrackRow track={mockTrack} view="list" />);
    expect(screen.getByTestId("song-card")).toBeInTheDocument();
  });

  it("passes the correct title to SongCard", () => {
    render(<TrackRow track={mockTrack} view="list" />);
    expect(screen.getByTestId("sc-title")).toHaveTextContent("Sunset Drive");
  });

  it("passes the correct artistName to SongCard", () => {
    render(<TrackRow track={mockTrack} view="list" />);
    expect(screen.getByTestId("sc-artist")).toHaveTextContent("Lo-Fi Artist");
  });

  it("passes the correct coverUrl to SongCard", () => {
    render(<TrackRow track={mockTrack} view="list" />);
    expect(screen.getByTestId("sc-cover")).toHaveTextContent(
      "https://example.com/track.png",
    );
  });

  it("passes stats props to SongCard", () => {
    render(<TrackRow track={mockTrack} view="list" />);
    expect(screen.getByTestId("sc-likes")).toHaveTextContent("42");
    expect(screen.getByTestId("sc-reposts")).toHaveTextContent("10");
    expect(screen.getByTestId("sc-plays")).toHaveTextContent("3.2K");
    expect(screen.getByTestId("sc-comments")).toHaveTextContent("5");
  });

  it("passes timeAgo to SongCard", () => {
    render(<TrackRow track={mockTrack} view="list" />);
    expect(screen.getByTestId("sc-timeago")).toHaveTextContent("2 hours ago");
  });

  it("does not render grid-specific elements in list view", () => {
    render(<TrackRow track={mockTrack} view="list" />);
    // The grid view's play button polygon should not be present
    expect(
      screen.queryByText("Lo-Fi Artist", { selector: "p" }),
    ).not.toBeInTheDocument();
  });
});

//npm run test -- src/features/library/tests/TrackRow.test.tsx
