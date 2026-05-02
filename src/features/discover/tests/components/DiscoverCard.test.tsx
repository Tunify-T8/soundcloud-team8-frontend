import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { renderWithProviders } from "@/test/renderWithProviders";
import { DiscoverCard } from "../../components/discoverCard";
import type { DiscoverTrack } from "@/features/discover/Discover";

const syncCurrentTrack = vi.fn();
const setIsPlaying = vi.fn();

vi.mock("@/features/playerUI/context/usePlayer", () => ({
  usePlayer: () => ({
    currentTrack: null,
    isPlaying: false,
    syncCurrentTrack,
    setIsPlaying,
  }),
}));

const item: DiscoverTrack = {
  id: "track-1",
  title: "Moonlit Harbor",
  artist: "Nora Sky",
  coverUrl: "https://example.com/moonlit-harbor.jpg",
  waveformUrl: "https://example.com/moonlit-harbor-wave.png",
  durationSeconds: 193,
  genre: "Indie",
  createdAt: "2026-04-03T08:01:12.000Z",
};

describe("DiscoverCard", () => {
  beforeEach(() => {
    syncCurrentTrack.mockReset();
    setIsPlaying.mockReset();
  });

  it("renders track title and artist", () => {
    renderWithProviders(
      <DiscoverCard
        item={item}
        queueTracks={[item]}
        trackIndex={0}
        queueId="made-for-you"
      />,
    );

    expect(screen.getByText("Moonlit Harbor")).toBeInTheDocument();
    expect(screen.getByText("Nora Sky")).toBeInTheDocument();
  });

  it("renders the cover image and starts playback on click", () => {
    renderWithProviders(
      <DiscoverCard
        item={item}
        queueTracks={[item]}
        trackIndex={0}
        queueId="made-for-you"
      />,
    );

    const image = screen.getByRole("img", { name: "Moonlit Harbor" });
    expect(image).toHaveAttribute("src", "https://example.com/moonlit-harbor.jpg");

    fireEvent.click(image.closest("div.group") ?? image);
    expect(syncCurrentTrack).toHaveBeenCalled();
    expect(setIsPlaying).toHaveBeenCalledWith(true);
  });
});
