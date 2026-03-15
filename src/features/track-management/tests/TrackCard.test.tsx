import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TrackCard from "../components/TrackCard";
import type { Track } from "../types";
import { Genre } from "../../../shared/types/Genre";

const mockTrack: Track = {
  id: "1",
  title: "Test Track",
  genre: Genre.ELECTRONIC,
  tags: ["chill", "vibes"],
  status: "finished",
  visibility: "public",
  audioUrl: "https://example.com/audio.mp3",
  description: "A test track",
  waveformData: [],
  duration: 225,
  date: "2024-01-01",
  likes: 100,
  comments: 20,
  reposts: 5,
  downloads: 10,
  plays: 1200,
  isPrivate: false,
  isHD: false,
  thumbnailUrl: "",
};

describe("TrackCard", () => {
  it("renders track title and duration", () => {
    render(<TrackCard track={mockTrack} />);
    expect(screen.getByText("Test Track")).toBeInTheDocument();
    expect(screen.getByText("3:45")).toBeInTheDocument();
  });

  it("renders track date", () => {
    render(<TrackCard track={mockTrack} />);
    expect(screen.getByText("2024-01-01")).toBeInTheDocument();
  });

  it("shows HD badge when isHD is true", () => {
    render(<TrackCard track={{ ...mockTrack, isHD: true }} />);
    expect(screen.getByText("HD")).toBeInTheDocument();
  });

  it("does not show HD badge when isHD is false", () => {
    render(<TrackCard track={mockTrack} />);
    expect(screen.queryByText("HD")).not.toBeInTheDocument();
  });

  it("shows lock icon when track is private", () => {
    const { container } = render(<TrackCard track={{ ...mockTrack, isPrivate: true }} />);
    expect(container.querySelector(".lucide-lock")).toBeInTheDocument();
  });

  it("calls onSelect with track id when checkbox changes", () => {
    const onSelect = vi.fn();
    render(<TrackCard track={mockTrack} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onSelect).toHaveBeenCalledWith("1");
  });

  it("checkbox reflects isSelected prop", () => {
    render(<TrackCard track={mockTrack} isSelected={true} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("displays - when likes is 0", () => {
    render(<TrackCard track={{ ...mockTrack, likes: 0 }} />);
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("displays - when likes is null", () => {
    render(<TrackCard track={{ ...mockTrack, likes: null }} />);
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });
});