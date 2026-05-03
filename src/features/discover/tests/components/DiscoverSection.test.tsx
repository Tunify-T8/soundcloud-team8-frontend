import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DiscoverSection } from "../../components/DiscoverSection";
import type { DiscoverTrack } from "@/features/discover/Discover";

vi.mock("../../components/DiscoverTrackCarousel", () => ({
  DiscoverTrackCarousel: ({ tracks }: { tracks: DiscoverTrack[] }) => (
    <div>
      {tracks.map((track) => (
        <span key={track.id}>{track.title}</span>
      ))}
    </div>
  ),
}));

const tracks: DiscoverTrack[] = [
  {
    id: "track-1",
    title: "Northern Lights",
    artist: "Tunify Sessions",
    coverUrl: "https://example.com/cover-1.jpg",
    waveformUrl: "https://example.com/wave-1.png",
    durationSeconds: 176,
    genre: "Ambient",
    createdAt: "2026-04-02T14:42:18.000Z",
  },
  {
    id: "track-2",
    title: "Golden Echo",
    artist: "Amira Eldeeb",
    coverUrl: "https://example.com/cover-2.jpg",
    waveformUrl: "https://example.com/wave-2.png",
    durationSeconds: 232,
    genre: "Soul",
    createdAt: "2026-04-02T12:03:33.000Z",
  },
];

describe("DiscoverSection", () => {
  it("renders the section title", () => {
    render(<DiscoverSection title="Made for you" tracks={tracks} />);
    expect(screen.getByRole("heading", { name: "Made for you" })).toBeInTheDocument();
  });

  it("renders the provided tracks through the carousel", () => {
    render(<DiscoverSection title="Made for you" tracks={tracks} />);
    expect(screen.getByText("Northern Lights")).toBeInTheDocument();
    expect(screen.getByText("Golden Echo")).toBeInTheDocument();
  });
});
