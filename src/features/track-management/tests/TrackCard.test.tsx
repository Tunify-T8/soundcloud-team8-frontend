import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TrackCard from "../components/TrackCard";
import type { Track } from "@/shared/types/Track";
import { Genre } from "@/shared/types/Genre";

const setCurrentTrack = vi.fn();
const setIsPlaying = vi.fn();

vi.mock("@/features/playerUI/context/usePlayer", () => ({
  usePlayer: () => ({
    currentTrack: null,
    isPlaying: false,
    setCurrentTrack,
    setIsPlaying,
  }),
}));

vi.mock("@/hooks/useSubscription", () => ({
  useSubscription: () => ({
    isArtistPro: false,
  }),
}));

vi.mock("@/features/player-core/Playbackservice", () => ({
  playbackService: {
    requestStreamUrl: vi.fn(),
  },
}));

vi.mock("../trackService", () => ({
  trackService: {
    getTrackDetails: vi.fn(),
  },
}));

vi.mock("@/features/library/tabs/playlists/components/CreatePlaylistOverlay", () => ({
  default: () => <div data-testid="playlist-overlay" />,
}));

vi.mock("../components/TrackDeleteConfirmModal", () => ({
  default: ({ onDeleted }: { onDeleted: (id: string) => void }) => (
    <button onClick={() => onDeleted("track-1")}>Confirm delete</button>
  ),
}));

vi.mock("@/features/premium/components/TrackActionModals", () => ({
  MasteringEligibilityModal: () => <div data-testid="mastering-modal" />,
  PremiumComingSoonModal: () => <div data-testid="premium-modal" />,
}));

const baseTrack: Track = {
  id: "track-1",
  title: "Neon Dreams",
  genre: Genre.POP,
  artist: "Synthwave Artist",
  tags: ["pop"],
  status: "finished",
  visibility: "public",
  audioUrl: "https://example.com/audio.mp3",
  description: "A test track",
  duration: 222,
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

describe("TrackCard", () => {
  beforeEach(() => {
    setCurrentTrack.mockReset();
    setIsPlaying.mockReset();
  });

  it("renders track details using the current formatting", () => {
    render(<TrackCard track={baseTrack} />);

    expect(screen.getByText("Neon Dreams")).toBeInTheDocument();
    expect(screen.getByText("Synthwave Artist")).toBeInTheDocument();
    expect(screen.getByText("3:42")).toBeInTheDocument();
    expect(screen.getByText("Jan 15, 2024")).toBeInTheDocument();
    expect(screen.getByText("4200")).toBeInTheDocument();
  });

  it("calls onSelect when the select button is clicked", async () => {
    const onSelect = vi.fn();
    render(<TrackCard track={baseTrack} onSelect={onSelect} />);

    await userEvent.click(screen.getByTestId("track-card-select-track-1"));

    expect(onSelect).toHaveBeenCalledWith("track-1");
  });

  it("opens the delete modal from the menu and forwards deletion", async () => {
    const onDelete = vi.fn();
    render(<TrackCard track={baseTrack} onDelete={onDelete} />);

    await userEvent.click(screen.getByTestId("track-card-menu-btn-track-1"));
    await userEvent.click(screen.getByRole("button", { name: /delete track/i }));
    await userEvent.click(screen.getByRole("button", { name: /confirm delete/i }));

    expect(onDelete).toHaveBeenCalledWith("track-1");
  });

  it("opens the playlist overlay from the menu", async () => {
    render(<TrackCard track={baseTrack} />);

    await userEvent.click(screen.getByTestId("track-card-menu-btn-track-1"));
    await userEvent.click(screen.getByRole("button", { name: /add to playlist/i }));

    expect(screen.getByTestId("playlist-overlay")).toBeInTheDocument();
  });
});
