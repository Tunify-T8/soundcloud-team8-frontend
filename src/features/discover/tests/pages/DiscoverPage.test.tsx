import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DiscoverPage from "../../pages/DiscoverPage";
import {
  getDiscoverTracks,
  getSuggestedArtists,
  getTrendingAlbums,
  getTrendingTracks,
} from "../../discoverService";

vi.mock("../../discoverService", () => ({
  getDiscoverTracks: vi.fn(),
  getSuggestedArtists: vi.fn(),
  getTrendingAlbums: vi.fn(),
  getTrendingTracks: vi.fn(),
}));

vi.mock("@/components/layout/Sidebar", () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

const mockedGetDiscoverTracks = vi.mocked(getDiscoverTracks);
const mockedGetSuggestedArtists = vi.mocked(getSuggestedArtists);
const mockedGetTrendingAlbums = vi.mocked(getTrendingAlbums);
const mockedGetTrendingTracks = vi.mocked(getTrendingTracks);

const mockDiscoverResponse = {
  items: [
    {
      id: "6e0a1fa3-dae1-4b20-aef0-8cc2a2cd7955",
      title: "Rock Revolution",
      artist: "Jazz Artist",
      coverUrl: "https://example.com/rock-revolution-cover.jpg",
      waveformUrl: "https://example.com/rock-revolution-waveform.png",
      durationSeconds: 199,
      genre: "Rock",
      createdAt: "2026-03-31T22:01:29.583Z",
    },
    {
      id: "4a6b2d9f-1a95-4c97-9b77-6c8cb4b5402d",
      title: "Midnight Current",
      artist: "Ava Mix",
      coverUrl: "https://example.com/midnight-current-cover.jpg",
      waveformUrl: "https://example.com/midnight-current-waveform.png",
      durationSeconds: 214,
      genre: "Electronic",
      createdAt: "2026-04-01T19:20:10.000Z",
    },
  ],
  page: 1,
  limit: 20,
  hasMore: false,
  personalized: false,
};

const mockSuggestedArtistsResponse = {
  items: [
    {
      id: "artist-1",
      name: "Imagine Dragons",
      avatarUrl: "https://example.com/imagine-dragons.jpg",
      followersCount: 5550000,
      isVerified: true,
    },
    {
      id: "artist-2",
      name: "Stranger Things",
      avatarUrl: "https://example.com/stranger-things.jpg",
      followersCount: 2475,
      isVerified: false,
    },
  ],
  page: 1,
  limit: 10,
  hasMore: false,
};

describe("DiscoverPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetDiscoverTracks.mockResolvedValue(mockDiscoverResponse);
    mockedGetSuggestedArtists.mockResolvedValue(mockSuggestedArtistsResponse);
    mockedGetTrendingAlbums.mockResolvedValue(mockDiscoverResponse);
    mockedGetTrendingTracks.mockResolvedValue(mockDiscoverResponse);
  });

  it("renders all discover section titles", async () => {
    render(<DiscoverPage />);

    expect(
      await screen.findByRole("heading", { name: "More of what you like" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Albums for you" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Made for you" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Artists to watch out for" }),
    ).toBeInTheDocument();
  });

  it("renders sidebar", async () => {
    render(<DiscoverPage />);

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "More of what you like" }),
    ).toBeInTheDocument();
  });

  it("renders discover tracks from API response", async () => {
    render(<DiscoverPage />);

    expect(
      (await screen.findAllByText("Rock Revolution")).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Midnight Current").length).toBeGreaterThan(0);
  });

  it("renders an empty state when API returns no items", async () => {
    const emptyResponse = {
      ...mockDiscoverResponse,
      items: [],
    };

    mockedGetDiscoverTracks.mockResolvedValueOnce({
      ...emptyResponse,
    });
    mockedGetSuggestedArtists.mockResolvedValueOnce({
      ...mockSuggestedArtistsResponse,
      items: [],
    });
    mockedGetTrendingAlbums.mockResolvedValueOnce({ ...emptyResponse });
    mockedGetTrendingTracks.mockResolvedValueOnce({ ...emptyResponse });

    render(<DiscoverPage />);

    expect(
      await screen.findByText("No discover tracks yet."),
    ).toBeInTheDocument();
  });
});
