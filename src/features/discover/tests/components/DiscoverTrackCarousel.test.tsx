import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DiscoverTrackCarousel } from "../../components/DiscoverTrackCarousel";
import type { DiscoverTrack } from "@/features/discover/Discover";

vi.mock("../../components/discoverCard", () => ({
  DiscoverCard: ({
    item,
  }: {
    item: DiscoverTrack;
  }) => <div>{item.title}</div>,
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
  {
    id: "track-3",
    title: "Velvet Prayer",
    artist: "Ibrahim M",
    coverUrl: "https://example.com/cover-3.jpg",
    waveformUrl: "https://example.com/wave-3.png",
    durationSeconds: 204,
    genre: "World",
    createdAt: "2026-04-02T10:10:00.000Z",
  },
];

function getScroller(container: HTMLElement): HTMLElement {
  const scroller = container.querySelector('div[class*="overflow-x-auto"]');
  if (!scroller) {
    throw new Error("Scroller element not found");
  }
  return scroller as HTMLElement;
}

describe("DiscoverTrackCarousel", () => {
  it("renders one card per track", () => {
    render(<DiscoverTrackCarousel tracks={tracks} queueId="discover" />);

    expect(screen.getByText("Northern Lights")).toBeInTheDocument();
    expect(screen.getByText("Golden Echo")).toBeInTheDocument();
    expect(screen.getByText("Velvet Prayer")).toBeInTheDocument();
  });

  it("scrolls right when the right button is clicked", async () => {
    const { container } = render(
      <DiscoverTrackCarousel tracks={tracks} queueId="discover" scrollStep={120} />,
    );

    const scroller = getScroller(container);
    const scrollByMock = vi.fn();

    Object.defineProperty(scroller, "scrollBy", { value: scrollByMock, writable: true });
    Object.defineProperty(scroller, "scrollLeft", { value: 0, writable: true, configurable: true });
    Object.defineProperty(scroller, "clientWidth", { value: 200, configurable: true });
    Object.defineProperty(scroller, "scrollWidth", { value: 600, configurable: true });

    fireEvent.scroll(scroller);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Scroll right" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Scroll right" }));
    expect(scrollByMock).toHaveBeenCalledWith({ left: 120, behavior: "smooth" });
  });

  it("scrolls left when the left button is clicked", async () => {
    const { container } = render(
      <DiscoverTrackCarousel tracks={tracks} queueId="discover" scrollStep={150} />,
    );

    const scroller = getScroller(container);
    const scrollByMock = vi.fn();

    Object.defineProperty(scroller, "scrollBy", { value: scrollByMock, writable: true });
    Object.defineProperty(scroller, "scrollLeft", { value: 80, writable: true, configurable: true });
    Object.defineProperty(scroller, "clientWidth", { value: 200, configurable: true });
    Object.defineProperty(scroller, "scrollWidth", { value: 600, configurable: true });

    fireEvent.scroll(scroller);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Scroll left" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Scroll left" }));
    expect(scrollByMock).toHaveBeenCalledWith({ left: -150, behavior: "smooth" });
  });
});
