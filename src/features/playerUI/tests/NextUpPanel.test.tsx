import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NextUpPanel from "../components/NextUpPanel";
import * as useQueueModule from "@/hooks/useQueue";
import * as usePlayerModule from "@/features/playerUI/context/usePlayer";
import type { useQueueReturn } from "@/features/player-core/types";
import type { PlayerContextValue } from "@/features/playerUI/context/PlayerTypes";

// ── Mock fns ──────────────────────────────────────────────────────────────────

const mockJumpTo        = vi.fn();
const mockClearQueue    = vi.fn();
const mockNext          = vi.fn();
const mockPrev          = vi.fn();
const mockLoadQueue     = vi.fn();
const mockAddTrack      = vi.fn();
const mockRemoveTrack   = vi.fn();
const mockToggleShuffle = vi.fn();
const mockToggleRepeat  = vi.fn();
const mockSetCurrentTrack = vi.fn();
const mockSetIsPlaying    = vi.fn();

// ── Base mock objects ─────────────────────────────────────────────────────────

const baseTrack = {
  trackId:         "track-1",
  title:           "Test Track",
  artist:          "Test Artist",
  durationSeconds: 185,
};

const baseQueue: useQueueReturn = {
  tracks:         [baseTrack],
  currentIndex:   0,
  currentTrackId: null,
  currentTrack:   null,
  shuffle:        false,
  repeat:         "none",
  isLoading:      false,
  error:          null,
  totalCount:     1,
  hasNext:        false,
  hasPrev:        false,
  loadQueue:      mockLoadQueue,
  next:           mockNext,
  prev:           mockPrev,
  addTrack:       mockAddTrack,
  removeTrack:    mockRemoveTrack,
  jumpTo:         mockJumpTo,
  toggleShuffle:  mockToggleShuffle,
  toggleRepeat:   mockToggleRepeat,
  clearQueue:     mockClearQueue,
};

const basePlayer: PlayerContextValue = {
  currentTrack:    null,
  isPlaying:       false,
  setCurrentTrack: mockSetCurrentTrack,
  setIsPlaying:    mockSetIsPlaying,
};

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock("@/hooks/useQueue", () => ({ useQueue: vi.fn() }));
vi.mock("@/features/playerUI/context/usePlayer", () => ({ usePlayer: vi.fn() }));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("NextUpPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQueueModule.useQueue).mockReturnValue(baseQueue);
    vi.mocked(usePlayerModule.usePlayer).mockReturnValue(basePlayer);
  });

  it("renders nothing when isOpen is false", () => {
    const { container } = render(<NextUpPanel isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the panel when isOpen is true", () => {
    render(<NextUpPanel isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("Next up")).toBeInTheDocument();
  });

  it("renders track title and artist", () => {
    render(<NextUpPanel isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("Test Track")).toBeInTheDocument();
    expect(screen.getByText("Test Artist")).toBeInTheDocument();
  });

  it("formats track duration correctly (3:05)", () => {
    render(<NextUpPanel isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("3:05")).toBeInTheDocument();
  });

  it("calls jumpTo with correct index when track row is clicked", () => {
    render(<NextUpPanel isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText("Test Track"));
    expect(mockJumpTo).toHaveBeenCalledWith(0);
  });

  it("calls clearQueue when Clear button is clicked", () => {
    render(<NextUpPanel isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText("Clear"));
    expect(mockClearQueue).toHaveBeenCalled();
  });

  it("calls onClose when the X button is clicked", () => {
    const onClose = vi.fn();
    render(<NextUpPanel isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when overlay backdrop is clicked", () => {
    const onClose = vi.fn();
    render(<NextUpPanel isOpen={true} onClose={onClose} />);
    const overlay = document.querySelector(".fixed.inset-0.z-40") as HTMLElement;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it("shows 'Queue is empty' when tracks array is empty", () => {
    vi.mocked(useQueueModule.useQueue).mockReturnValueOnce({ ...baseQueue, tracks: [], totalCount: 0 });
    render(<NextUpPanel isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("Queue is empty")).toBeInTheDocument();
  });


  it("toggles autoplay when the autoplay button is clicked", () => {
    render(<NextUpPanel isOpen={true} onClose={vi.fn()} />);
    const toggle = screen.getByLabelText("Toggle autoplay");
    fireEvent.click(toggle);
    expect(toggle).toHaveStyle({ background: "#555" });
  });

  it("renders context menu when MoreHorizontal button is clicked", () => {
    render(<NextUpPanel isOpen={true} onClose={vi.fn()} />);
    fireEvent.mouseEnter(screen.getByText("Test Track").closest(".track-row")!);
    const moreButtons = document.querySelectorAll(".track-actions button");
    fireEvent.click(moreButtons[1]);
    expect(screen.getByText("Like")).toBeInTheDocument();
    expect(screen.getByText("Repost")).toBeInTheDocument();
    expect(screen.getByText("Share")).toBeInTheDocument();
  });

  it("renders multiple tracks", () => {
    const extraTrack = { trackId: "track-2", title: "Second Track", artist: "Artist B", durationSeconds: 60 };
    vi.mocked(useQueueModule.useQueue).mockReturnValueOnce({
      ...baseQueue,
      tracks: [baseTrack, extraTrack],
      totalCount: 2,
    });
    render(<NextUpPanel isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("Test Track")).toBeInTheDocument();
    expect(screen.getByText("Second Track")).toBeInTheDocument();
  });

  it("formats single-digit seconds with leading zero (1:05)", () => {
    vi.mocked(useQueueModule.useQueue).mockReturnValueOnce({
      ...baseQueue,
      tracks: [{ ...baseTrack, durationSeconds: 65 }],
    });
    render(<NextUpPanel isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("1:05")).toBeInTheDocument();
  });
});

//npm run test -- src/features/playerUI/tests/NextUpPanel.test.tsx