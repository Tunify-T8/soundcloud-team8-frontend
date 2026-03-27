import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TrackCard from "../components/TrackCard";
import type { Track } from "../../../shared/types/Track";
import { Genre } from "../../../shared/types/Genre"; //couldn't find file when path @/shared/types/Genre ?

const baseTrack: Track = {
  id: "track-1",
  title: "Neon Dreams",
  genre: Genre.POP,
  tags: ["pop", "electronic"],
  status: "finished",
  visibility: "public",
  audioUrl: "https://example.com/audio.mp3",
  description: "A test track",
  duration: 222, // 3:42 in seconds
  date: "2024-01-15",
  likes: 120,
  comments: 8,
  reposts: 5,
  downloads: 30,
  plays: 4200,
  isHD: false,
  isPrivate: false,
  thumbnailUrl: "",
};

const makeTrack = (overrides: Partial<Track> = {}): Track => ({
  ...baseTrack,
  ...overrides,
});


//tests start 

describe("TrackCard", () => {
  it("renders track title", () => {
    render(<TrackCard track={baseTrack} />);
    expect(screen.getByText("Neon Dreams")).toBeInTheDocument();
  });

  it("renders the date", () => {
    render(<TrackCard track={baseTrack} />);
    expect(screen.getByText("2024-01-15")).toBeInTheDocument();
  });

  it("renders plays count", () => {
    render(<TrackCard track={baseTrack} />);
    expect(screen.getByText("4200")).toBeInTheDocument();
  });

  it("shows HD badge when isHD is true", () => {
    render(<TrackCard track={makeTrack({ isHD: true })} />);
    expect(screen.getByText("HD")).toBeInTheDocument();
  });

  it("does not show HD badge when isHD is false", () => {
    render(<TrackCard track={baseTrack} />);
    expect(screen.queryByText("HD")).not.toBeInTheDocument();
  });

  it("shows Lock icon when track is private", () => {
    const { container } = render(<TrackCard track={makeTrack({ isPrivate: true })} />);
    const lockWrapper = container.querySelector(".absolute.-bottom-1.-right-1");
    expect(lockWrapper).toBeInTheDocument();
  });

  it("does not show Lock icon when track is public", () => {
    const { container } = render(<TrackCard track={baseTrack} />);
    const lockWrapper = container.querySelector(".absolute.-bottom-1.-right-1");
    expect(lockWrapper).not.toBeInTheDocument();
  });

  it("checkbox reflects isSelected prop", () => {
    render(<TrackCard track={baseTrack} isSelected={true} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("calls onSelect with track id when checkbox changes", () => {
    const onSelect = vi.fn();
    render(<TrackCard track={baseTrack} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onSelect).toHaveBeenCalledWith("track-1");
  });

  it("does not propagate click from checkbox to parent", () => {
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <TrackCard track={baseTrack} onSelect={vi.fn()} />
      </div>
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(parentClick).not.toHaveBeenCalled();
  });

  it("does not propagate click from more-menu button to parent", () => {
    const parentClick = vi.fn();
    const { container } = render(
      <div onClick={parentClick}>
        <TrackCard track={baseTrack} />
      </div>
    );
    const moreBtn = container.querySelector("button.p-1");
    fireEvent.click(moreBtn!);
    expect(parentClick).not.toHaveBeenCalled();
  });

  it("applies hover background class on mouse enter", () => {
    const { container } = render(<TrackCard track={baseTrack} />);
    const card = container.firstChild as HTMLElement;
    fireEvent.mouseEnter(card);
    expect(card.className).toContain("bg-zinc-800");
  });

  it("removes hover background class on mouse leave", () => {
    const { container } = render(<TrackCard track={baseTrack} />);
    const card = container.firstChild as HTMLElement;
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);
    expect(card.className).toContain("bg-zinc-900");
  });
});


//running each test individually commands:
//npm run test -- src/features/track-management/tests/TrackCard.test.tsx