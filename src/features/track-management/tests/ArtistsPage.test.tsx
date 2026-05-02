import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import ArtistsPage from "../pages/ArtistsPage";
import { trackService } from "../trackService";
import type { Track } from "@/shared/types/Track";
import { Genre } from "@/shared/types/Genre";

vi.mock("../trackService", () => ({
  trackService: {
    getUploadedTracks: vi.fn(),
    getMyAnalytics: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock("../components/ArtistsSidebar", () => ({
  default: () => <div data-testid="artists-sidebar" />,
}));

vi.mock("../components/ArtistsNavbar", () => ({
  default: () => <div data-testid="artists-navbar" />,
}));

vi.mock("../components/TrackList", () => ({
  default: ({ tracks }: { tracks: Track[] }) => (
    <div data-testid="track-list">
      {tracks.map((track) => (
        <div key={track.id} data-testid="track-row">
          {track.title}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../components/BenefitsSection", () => ({
  BenefitsSection: () => <div data-testid="benefits-section" />,
}));

vi.mock("@/features/upload/components/UploadQuotaBanner", () => ({
  default: () => <div>Upload quota banner</div>,
}));

vi.mock("@/features/premium/components/SubscriptionBadge", () => ({
  default: () => <div>Subscription badge</div>,
}));

vi.mock("@/features/premium/components/ArtistProUpgradeButton", () => ({
  default: ({ children }: { children: any }) => <button>{children}</button>,
}));

vi.mock("@/features/profile/context/useMe", () => ({
  useMe: () => ({ me: { id: "me-1" } }),
}));

vi.mock("@/hooks/usePlayContext", () => ({
  usePlayContext: vi.fn(),
}));

vi.mock("@/hooks/useSubscription", () => ({
  useSubscription: () => ({
    tier: "artist",
    isArtistPro: false,
  }),
}));

const makeTrack = (overrides: Partial<Track> = {}): Track => ({
  id: "t1",
  title: "Test Track",
  genre: Genre.POP,
  artist: "Test Artist",
  tags: [],
  status: "finished",
  visibility: "public",
  audioUrl: "https://example.com/audio.mp3",
  description: "",
  duration: 180,
  date: "2024-01-01",
  likes: 10,
  comments: 2,
  reposts: 1,
  downloads: 5,
  plays: 100,
  isHD: false,
  isPrivate: false,
  thumbnailUrl: "",
  ...overrides,
});

const sampleTracks: Track[] = [
  makeTrack({ id: "t1", title: "Alpha Track", isPrivate: false }),
  makeTrack({ id: "t2", title: "Beta Track", isPrivate: true }),
  makeTrack({ id: "t3", title: "Gamma Track", isPrivate: false }),
];

function renderPage() {
  return render(
    <MemoryRouter>
      <ArtistsPage />
    </MemoryRouter>,
  );
}

describe("ArtistsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(trackService.getUploadedTracks).mockResolvedValue(sampleTracks);
  });

  it("renders the artists shell and studio header", async () => {
    renderPage();

    expect(screen.getByTestId("artists-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("artists-navbar")).toBeInTheDocument();
    expect(screen.getByTestId("studio-header")).toBeInTheDocument();
    expect(screen.getByText("Artist Studio")).toBeInTheDocument();
    expect(screen.getByText("Upload quota banner")).toBeInTheDocument();
  });

  it("shows the SoundCloud Tracks tab content by default", async () => {
    renderPage();

    expect(screen.getByTestId("tracks-search-input")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByTestId("track-row")).toHaveLength(sampleTracks.length);
    });
    expect(screen.getByTestId("tracks-count")).toHaveTextContent("3 tracks");
  });

  it("filters tracks by search query", async () => {
    renderPage();
    await waitFor(() => screen.getAllByTestId("track-row"));

    fireEvent.change(screen.getByTestId("tracks-search-input"), {
      target: { value: "Alpha" },
    });

    await waitFor(() => {
      expect(screen.getAllByTestId("track-row")).toHaveLength(1);
    });
    expect(screen.getByText("Alpha Track")).toBeInTheDocument();
  });

  it("filters tracks by visibility", async () => {
    renderPage();
    await waitFor(() => screen.getAllByTestId("track-row"));

    fireEvent.click(screen.getByTestId("tracks-filter-private"));

    await waitFor(() => {
      expect(screen.getAllByTestId("track-row")).toHaveLength(1);
    });
    expect(screen.getByText("Beta Track")).toBeInTheDocument();
  });

  it("switches to the Distribution tab", async () => {
    renderPage();

    fireEvent.click(screen.getByTestId("tab-distribution"));
    expect(
      await screen.findByText(/distribute your music to spotify, apple music, youtube, and more/i),
    ).toBeInTheDocument();
  });
});
