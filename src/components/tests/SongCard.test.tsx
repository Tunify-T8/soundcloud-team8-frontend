import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SongCard from "../ui/SongCard";
import { Genre } from "../../shared/types/Genre";
import { waveGenerators } from "../Waveforms";

vi.mock("../Waveforms", () => ({
  waveGenerators: [vi.fn(() => Array(140).fill(0.5))],
}));

const defaultProps = {
  artistName: "Test Artist",
  title: "Test Title",
  coverUrl: "",
  timeAgo: "3 days ago",
  likes: "42",
  reposts: "7",
  plays: "1.2k",
  comments: "5",
  progress: 0,
  waveformSeed: 0,
};

const renderCard = (overrides = {}) =>
  render(<SongCard {...defaultProps} {...overrides} />);

describe("SongCard", () => {

  it("renders the artist name", () => {
    renderCard();
    expect(screen.getByText("Test Artist")).toBeInTheDocument();
  });

  it("renders the track title", () => {
    renderCard();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders the timeAgo string", () => {
    renderCard();
    expect(screen.getByText("3 days ago")).toBeInTheDocument();
  });

  it("renders the genre tag", () => {
    renderCard();
    expect(screen.getByText(`# ${Genre.POP}`)).toBeInTheDocument();
  });

  it("renders the likes count", () => {
    renderCard();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders the reposts count", () => {
    renderCard();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("renders the plays count", () => {
    renderCard();
    expect(screen.getByText("1.2k")).toBeInTheDocument();
  });

  it("renders the comments count", () => {
    renderCard();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  // ── Cover art ───────────────────────────────────────────────────────────────

  it("renders the cover image when coverUrl is provided", () => {
    renderCard({ coverUrl: "https://example.com/cover.jpg", title: "Test Title" });
    const img = screen.getByRole("img", { name: "Test Title" });
    expect(img).toHaveAttribute("src", "https://example.com/cover.jpg");
  });

  it("renders 140 waveform bars", () => {
    const { container } = renderCard();
    const waveContainer = container.querySelector(".h-\\[44px\\]");
    const bars = waveContainer?.querySelectorAll(".flex-1.rounded-\\[1px\\]");
    expect(bars).toHaveLength(140);
  });

  it("calls the waveform generator with the waveformSeed", () => {
    renderCard({ waveformSeed: 3 });
    expect(waveGenerators[0]).toHaveBeenCalledWith(3);
  });

  it("keeps the waveform white for non-playing tracks even when progress is passed in", () => {
    const { container } = renderCard({ progress: 0.5 });
    const waveContainer = container.querySelector(".h-\\[44px\\]");
    const bars = waveContainer?.querySelectorAll(".flex-1.rounded-\\[1px\\]");
    const firstBar = bars?.[0] as HTMLElement;
    expect(firstBar.style.backgroundColor).toBe("rgb(214, 214, 214)");
  });

  it("uses a brighter white on waveform hover", () => {
    const { container } = renderCard({ progress: 0 });
    const waveContainer = container.querySelector(".h-\\[44px\\]")!;
    fireEvent.mouseEnter(waveContainer);
    const bars = waveContainer.querySelectorAll(".flex-1.rounded-\\[1px\\]");
    const firstBar = bars[0] as HTMLElement;
    expect(firstBar.style.backgroundColor).toBe("rgb(245, 245, 245)");
  });

  it("uses the default white when not hovered", () => {
    const { container } = renderCard({ progress: 0 });
    const waveContainer = container.querySelector(".h-\\[44px\\]");
    const bars = waveContainer?.querySelectorAll(".flex-1.rounded-\\[1px\\]");
    const firstBar = bars?.[0] as HTMLElement;
    expect(firstBar.style.backgroundColor).toBe("rgb(214, 214, 214)");
  });

 
});

//npm run test -- src/components/tests/SongCard.test.tsx
