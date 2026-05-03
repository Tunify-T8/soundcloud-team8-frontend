import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import SongCard from "../ui/SongCard";
import { Genre } from "@/shared/types/Genre";
import { waveGenerators } from "../Waveforms";
import { usePlayer } from "@/features/playerUI/context/usePlayer";
import { useQueue } from "@/hooks/useQueue";
import { useSubscription } from "@/hooks/useSubscription";
import { useMe } from "@/features/profile/context/useMe";
import { engagementService } from "@/features/engagement/services/engagementService";

const mockSetCurrentTrack = vi.fn();
const mockSetIsPlaying = vi.fn();
const mockRequestSeek = vi.fn();
const mockAddTrack = vi.fn();

vi.mock("../Waveforms", () => ({
  waveGenerators: [vi.fn(() => Array(140).fill(0.5))],
}));

vi.mock("@/features/playerUI/context/usePlayer", () => ({
  usePlayer: vi.fn(),
}));

vi.mock("@/hooks/useQueue", () => ({
  useQueue: vi.fn(),
}));

vi.mock("@/hooks/useSubscription", () => ({
  useSubscription: vi.fn(),
}));

vi.mock("@/features/profile/context/useMe", () => ({
  useMe: vi.fn(),
}));

vi.mock("@/features/engagement/services/engagementService", () => ({
  engagementService: {
    getEngagement: vi.fn(),
    likeTrack: vi.fn(),
    unlikeTrack: vi.fn(),
    repostTrack: vi.fn(),
    unrepostTrack: vi.fn(),
  },
}));

vi.mock("@/features/player-core/Playbackservice", () => ({
  playbackService: {
    requestStreamUrl: vi.fn(),
  },
}));

vi.mock("@/features/library/downloadStorage", () => ({
  DOWNLOAD_LIBRARY_CHANGED_EVENT: "download-library-changed",
  hasDownload: vi.fn(),
  saveDownload: vi.fn(),
}));

vi.mock("@/features/library/tabs/playlists/components/CreatePlaylistOverlay", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="playlist-overlay">playlist overlay</div> : null,
}));

vi.mock("@/components/ui/ShareOverlay", () => ({
  default: ({ shareUrl }: { shareUrl: string }) => (
    <div data-testid="share-overlay">{shareUrl}</div>
  ),
}));

const defaultProps = {
  trackId: "track-1",
  entityLinkTo: "/tracks/track-1",
  artistLinkTo: "/artists/test-artist",
  artistName: "Test Artist",
  title: "Test Title",
  coverUrl: "https://example.com/cover.jpg",
  timeAgo: "3 days ago",
  genre: Genre.POP,
  likes: "42",
  reposts: "7",
  plays: "1.2k",
  comments: "5",
  waveformSeed: 3,
};

function renderCard(overrides: Partial<typeof defaultProps> = {}) {
  return render(
    <MemoryRouter>
      <SongCard {...defaultProps} {...overrides} />
    </MemoryRouter>,
  );
}

describe("SongCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePlayer).mockReturnValue({
      currentTrack: null,
      isPlaying: false,
      progress: 0,
      setCurrentTrack: mockSetCurrentTrack,
      setIsPlaying: mockSetIsPlaying,
      requestSeek: mockRequestSeek,
    } as never);
    vi.mocked(useQueue).mockReturnValue({
      addTrack: mockAddTrack,
      currentIndex: 0,
      currentTrackId: null,
    } as never);
    vi.mocked(useSubscription).mockReturnValue({
      hasOfflineListening: false,
    } as never);
    vi.mocked(useMe).mockReturnValue({
      me: null,
    } as never);
    vi.mocked(engagementService.getEngagement).mockReturnValue(
      new Promise(() => {}) as never,
    );
  });

  it("renders the current track metadata and counters", () => {
    renderCard();

    expect(screen.getByText("Test Artist")).toBeInTheDocument();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("3 days ago")).toBeInTheDocument();
    expect(screen.getByText("# pop")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("1.2k")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders the provided cover image and builds waveform bars from the seed", () => {
    const { container } = renderCard();

    expect(screen.getByRole("img", { name: "Test Title" })).toHaveAttribute(
      "src",
      "https://example.com/cover.jpg",
    );
    expect(waveGenerators[0]).toHaveBeenCalledWith(3);
    expect(container.querySelectorAll(".relative.flex-1").length).toBeGreaterThan(50);
  });

  it("starts playback for a new track when the play button is clicked", async () => {
    renderCard();

    await userEvent.click(screen.getByRole("button", { name: "Play" }));

    expect(mockSetCurrentTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "track-1",
        title: "Test Title",
        artist: "Test Artist",
        thumbnailUrl: "https://example.com/cover.jpg",
      }),
    );
    expect(mockSetIsPlaying).toHaveBeenCalledWith(true);
  });

  it("opens the share overlay with the track URL", async () => {
    renderCard();

    await userEvent.click(screen.getByRole("button", { name: "Share" }));

    expect(screen.getByTestId("share-overlay")).toHaveTextContent(
      `${window.location.origin}/tracks/track-1`,
    );
  });

  it("adds the track to next up from the overflow menu", async () => {
    renderCard();

    await userEvent.click(screen.getByRole("button", { name: "More options" }));
    await userEvent.click(screen.getByRole("button", { name: /add to next up/i }));

    expect(mockAddTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        trackId: "track-1",
        title: "Test Title",
        artist: "Test Artist",
      }),
      0,
    );
  });
});
