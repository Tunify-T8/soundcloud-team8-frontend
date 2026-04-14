import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PlayerBar from "../components/PlayerBar";
import * as usePlaybackModule from "@/hooks/Useplayback";
import * as useQueueModule from "@/hooks/useQueue";
import * as usePlayerModule from "@/features/playerUI/context/usePlayer";
import type { useQueueReturn, usePlaybackReturn } from "@/features/player-core/types";
import type { PlayerContextValue } from "@/features/playerUI/context/PlayerTypes";

// ── Mock fns ──────────────────────────────────────────────────────────────────

const mockPlay            = vi.fn();
const mockPause           = vi.fn();
const mockSeek            = vi.fn();
const mockSetVolume       = vi.fn();
const mockToggleMute      = vi.fn();
const mockSetIsPlaying    = vi.fn();
const mockSetCurrentTrack = vi.fn();
const mockToggleShuffle   = vi.fn();
const mockToggleRepeat    = vi.fn();
const mockNext            = vi.fn();
const mockPrev            = vi.fn();
const mockLoadQueue       = vi.fn();
const mockAddTrack        = vi.fn();
const mockRemoveTrack     = vi.fn();
const mockJumpTo          = vi.fn();
const mockClearQueue      = vi.fn();

// ── Base mock objects ─────────────────────────────────────────────────────────

const basePlayback: usePlaybackReturn = {
  status:                  "ready",
  bundle:                  null,
  error:                   null,
  currentTime:             30,
  duration:                180,
  volume:                  0.8,
  isMuted:                 false,
  buffered:                0.5,
  previewSecondsRemaining: null,
  play:                    mockPlay,
  pause:                   mockPause,
  seek:                    mockSeek,
  setVolume:               mockSetVolume,
  toggleMute:              mockToggleMute,
  audioRef:                { current: null },
};

const baseQueue: useQueueReturn = {
  tracks:         [],
  currentIndex:   0,
  currentTrackId: null,
  currentTrack:   null,
  shuffle:        false,
  repeat:         "none",
  isLoading:      false,
  error:          null,
  totalCount:     0,
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

const baseCurrentTrack = {
  id:           "track-1",
  title:        "Test Song",
  artist:       "Test Artist",
  thumbnailUrl: "https://example.com/cover.jpg",
  duration:     180,
};

const basePlayer: PlayerContextValue = {
  currentTrack:    baseCurrentTrack,
  isPlaying:       false,
  setCurrentTrack: mockSetCurrentTrack,
  setIsPlaying:    mockSetIsPlaying,
};

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock("@/hooks/Useplayback", () => ({ usePlayback: vi.fn() }));
vi.mock("@/hooks/useQueue",    () => ({ useQueue:    vi.fn() }));
vi.mock("@/features/playerUI/context/usePlayer", () => ({ usePlayer: vi.fn() }));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("PlayerBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePlaybackModule.usePlayback).mockReturnValue(basePlayback);
    vi.mocked(useQueueModule.useQueue).mockReturnValue(baseQueue);
    vi.mocked(usePlayerModule.usePlayer).mockReturnValue(basePlayer);
  });

  it("renders nothing when currentTrack is null", () => {
    vi.mocked(usePlayerModule.usePlayer).mockReturnValueOnce({
      ...basePlayer,
      currentTrack: null,
    });
    const { container } = render(<PlayerBar />);
    expect(container.firstChild).toBeNull();
  });

  it("renders track title and artist", () => {
    render(<PlayerBar />);
    expect(screen.getByText("Test Song")).toBeInTheDocument();
    expect(screen.getByText("Test Artist")).toBeInTheDocument();
  });

  it("renders the cover thumbnail when thumbnailUrl is provided", () => {
    render(<PlayerBar />);
    const img = screen.getByAltText("cover") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/cover.jpg");
  });

  it("shows play button when not playing", () => {
    render(<PlayerBar />);
    expect(screen.getByLabelText("Play")).toBeInTheDocument();
  });

  it("shows pause button when playing", () => {
    vi.mocked(usePlaybackModule.usePlayback).mockReturnValueOnce({ ...basePlayback, status: "playing" });
    render(<PlayerBar />);
    expect(screen.getByLabelText("Pause")).toBeInTheDocument();
  });

  it("calls play and setIsPlaying(true) when play button is clicked", () => {
    render(<PlayerBar />);
    fireEvent.click(screen.getByLabelText("Play"));
    expect(mockPlay).toHaveBeenCalled();
    expect(mockSetIsPlaying).toHaveBeenCalledWith(true);
  });

  it("calls pause and setIsPlaying(false) when pause button is clicked", () => {
    vi.mocked(usePlaybackModule.usePlayback).mockReturnValueOnce({ ...basePlayback, status: "playing" });
    render(<PlayerBar />);
    fireEvent.click(screen.getByLabelText("Pause"));
    expect(mockPause).toHaveBeenCalled();
    expect(mockSetIsPlaying).toHaveBeenCalledWith(false);
  });

  it("calls prev when previous button is clicked", () => {
    render(<PlayerBar />);
    fireEvent.click(document.querySelectorAll("svg.cursor-pointer")[0] as SVGElement);
    expect(mockPrev).toHaveBeenCalled();
  });

  it("calls next when next button is clicked", () => {
    render(<PlayerBar />);
    fireEvent.click(document.querySelectorAll("svg.cursor-pointer")[1] as SVGElement);
    expect(mockNext).toHaveBeenCalled();
  });

  it("calls toggleShuffle when shuffle icon is clicked", () => {
    render(<PlayerBar />);
    fireEvent.click(document.querySelector(".lucide-shuffle") as SVGElement);
    expect(mockToggleShuffle).toHaveBeenCalled();
  });

  it("calls toggleRepeat when repeat icon is clicked", () => {
    render(<PlayerBar />);
    fireEvent.click(document.querySelector(".lucide-repeat-2") as SVGElement);
    expect(mockToggleRepeat).toHaveBeenCalled();
  });

  it("displays formatted current time and duration", () => {
    render(<PlayerBar />);
    expect(screen.getByText("0:30")).toBeInTheDocument();
    expect(screen.getByText("3:00")).toBeInTheDocument();
  });

  it("seeks to correct position when progress bar is clicked", () => {
    render(<PlayerBar />);
    const progressBar = document.querySelector(".group.cursor-pointer") as HTMLElement;
    Object.defineProperty(progressBar, "getBoundingClientRect", {
      value: () => ({ left: 0, width: 300, top: 0, bottom: 0, right: 300 }),
    });
    fireEvent.click(progressBar, { clientX: 150 });
    expect(mockSeek).toHaveBeenCalledWith(90);
  });

  it("shows volume slider on mouse enter", () => {
    render(<PlayerBar />);
    fireEvent.mouseEnter(screen.getByLabelText("Mute").closest(".relative") as HTMLElement);
    expect(document.querySelector(".bg-zinc-600.rounded-full.cursor-pointer")).toBeInTheDocument();
  });

  it("calls toggleMute when mute button is clicked", () => {
    render(<PlayerBar />);
    fireEvent.click(screen.getByLabelText("Mute"));
    expect(mockToggleMute).toHaveBeenCalled();
  });

  it("shows VolumeX icon when muted", () => {
    vi.mocked(usePlaybackModule.usePlayback).mockReturnValueOnce({ ...basePlayback, isMuted: true });
    render(<PlayerBar />);
    expect(screen.getByLabelText("Unmute")).toBeInTheDocument();
  });

  it("calls loadQueue on mount", () => {
    render(<PlayerBar />);
    expect(mockLoadQueue).toHaveBeenCalledWith({
      contextType: "playlist",
      contextId:   "playlist-1",
      shuffle:     false,
      repeat:      "none",
    });
  });

  it("space bar triggers play when not playing", () => {
    render(<PlayerBar />);
    fireEvent.keyDown(window, { code: "Space" });
    expect(mockPlay).toHaveBeenCalled();
    expect(mockSetIsPlaying).toHaveBeenCalledWith(true);
  });

  it("space bar does not trigger when focused on an input", () => {
    render(<><PlayerBar /><input data-testid="text-input" /></>);
    fireEvent.keyDown(screen.getByTestId("text-input"), { code: "Space", target: screen.getByTestId("text-input") });
    expect(mockPlay).not.toHaveBeenCalled();
  });
});

//npm run test -- src/features/playerUI/tests/PlayerBar.test.tsx