import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DiscoverCard } from "../../components/discoverCard";
import type { DiscoverTrack } from "@/features/discover/Discover";

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
  it("renders track title and artist", () => {
    render(<DiscoverCard item={item} index={0} />);

    expect(screen.getByText("Moonlit Harbor")).toBeInTheDocument();
    expect(screen.getByText("Nora Sky")).toBeInTheDocument();
  });

  it("renders cover image with correct alt and src", () => {
    render(<DiscoverCard item={item} index={1} />);

    const image = screen.getByRole("img", { name: "Moonlit Harbor" });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      "src",
      "https://example.com/moonlit-harbor.jpg",
    );
  });
});
