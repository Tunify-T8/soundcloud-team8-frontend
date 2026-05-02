import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DiscoverPage from "../../pages/DiscoverPage";
import { renderWithProviders } from "@/test/renderWithProviders";
import {
  getDiscoverTracks,
  getRecommendations,
  getSuggestedArtists,
  getTrendingAlbums,
  getTrendingTracks,
} from "../../discoverService";

vi.mock("../../discoverService", () => ({
  getDiscoverTracks: vi.fn(),
  getRecommendations: vi.fn(),
  getSuggestedArtists: vi.fn(),
  getTrendingAlbums: vi.fn(),
  getTrendingTracks: vi.fn(),
}));

vi.mock("@/features/track-management/trackService", () => ({
  trackService: {
    getUploadedTracks: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/features/profile/context/useMe", () => ({
  useMe: () => ({ me: { id: "me-1", username: "nada" } }),
}));

vi.mock("@/hooks/usePlayContext", () => ({
  usePlayContext: vi.fn(),
}));

vi.mock("@/components/layout/Sidebar", () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

const mockedGetDiscoverTracks = vi.mocked(getDiscoverTracks);
const mockedGetRecommendations = vi.mocked(getRecommendations);
const mockedGetSuggestedArtists = vi.mocked(getSuggestedArtists);
const mockedGetTrendingAlbums = vi.mocked(getTrendingAlbums);
const mockedGetTrendingTracks = vi.mocked(getTrendingTracks);

const mockDiscoverResponse = {
  items: [
    {
      id: "track-1",
      title: "Rock Revolution",
      artist: "Jazz Artist",
      coverUrl: "https://example.com/rock-revolution-cover.jpg",
      waveformUrl: "https://example.com/rock-revolution-waveform.png",
      durationSeconds: 199,
      genre: "Rock",
      createdAt: "2026-03-31T22:01:29.583Z",
    },
  ],
  page: 1,
  limit: 20,
  hasMore: false,
  personalized: false,
};

const mockRecommendationsResponse = {
  data: [
    {
      trackId: "track-2",
      artistId: "artist-1",
      artistAvatarUrl: "https://example.com/artist-1.jpg",
      artistIsCertified: false,
      title: "Midnight Current",
      artist: "Ava Mix",
      genre: "Electronic",
      durationInSeconds: 214,
      coverUrl: "https://example.com/midnight-current-cover.jpg",
      waveformUrl: "https://example.com/midnight-current-waveform.png",
      numberOfComments: 0,
      numberOfLikes: 0,
      numberOfReposts: 0,
      numberOfListens: 0,
      isLiked: false,
      isReposted: false,
      reason: "Because you listen to Electronic",
      reasonType: "GENRE",
    },
  ],
  page: 1,
  limit: 20,
  hasMore: false,
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
  ],
  page: 1,
  limit: 10,
  hasMore: false,
};

describe("DiscoverPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    mockedGetDiscoverTracks.mockResolvedValue(mockDiscoverResponse as never);
    mockedGetRecommendations.mockResolvedValue(mockRecommendationsResponse as never);
    mockedGetSuggestedArtists.mockResolvedValue(mockSuggestedArtistsResponse as never);
    mockedGetTrendingAlbums.mockResolvedValue(mockDiscoverResponse as never);
    mockedGetTrendingTracks.mockResolvedValue(mockDiscoverResponse as never);
  });

  it("renders the main discover sections and sidebar", async () => {
    renderWithProviders(<DiscoverPage />);

    expect(await screen.findByRole("heading", { name: "More of what you like" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recently Played" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Albums for you" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Made for you" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Trending by genre" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Artists to watch out for" })).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("renders tracks returned from the API", async () => {
    renderWithProviders(<DiscoverPage />);

    expect((await screen.findAllByText("Rock Revolution")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Midnight Current").length).toBeGreaterThan(0);
  });

  it("renders the empty state when all sources return no items", async () => {
    mockedGetDiscoverTracks.mockResolvedValueOnce({ ...mockDiscoverResponse, items: [] } as never);
    mockedGetRecommendations.mockResolvedValueOnce({ ...mockRecommendationsResponse, data: [] } as never);
    mockedGetSuggestedArtists.mockResolvedValueOnce({ ...mockSuggestedArtistsResponse, items: [] } as never);
    mockedGetTrendingAlbums.mockResolvedValueOnce({ ...mockDiscoverResponse, items: [] } as never);
    mockedGetTrendingTracks.mockResolvedValueOnce({ ...mockDiscoverResponse, items: [] } as never);

    renderWithProviders(<DiscoverPage />);

    expect(await screen.findByText("No discover tracks yet.")).toBeInTheDocument();
  });
});
