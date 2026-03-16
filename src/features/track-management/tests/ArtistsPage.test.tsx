import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ArtistsPage from "../pages/ArtistsPage";
import { trackService } from "../trackService";
import type { Track } from "../types";
import { Genre } from "../../../shared/types/Genre";
vi.mock("../trackService");
vi.mock("../components/ArtistsSidebar", () => ({
  default: () => <div data-testid="artists-sidebar" />,
}));
vi.mock("../components/ArtistsNavbar", () => ({
  default: () => <div data-testid="artists-navbar" />,
}));
vi.mock("../components/TrackList", () => ({
  default: ({ tracks }: { tracks: Track[] }) => (
    <div data-testid="track-list">
      {tracks.map((t) => (
        <div key={t.id} data-testid="track-row">
          {t.title}
        </div>
      ))}
    </div>
  ),
}));

const makeTrack = (overrides: Partial<Track> = {}): Track => ({
  id: "t1",
  title: "Test Track",
  genre: Genre.POP,
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
  makeTrack({ id: "t2", title: "Beta Track",  isPrivate: true  }),
  makeTrack({ id: "t3", title: "Gamma Track", isPrivate: false }),
];


describe("ArtistsPage", () => {
  beforeEach(() => {
    vi.mocked(trackService.getUploadedTracks).mockResolvedValue(sampleTracks);
  });

  it("renders the sidebar", async () => {
    render(<ArtistsPage />);
    expect(screen.getByTestId("artists-sidebar")).toBeInTheDocument();
  });

  it("renders the navbar", async () => {
    render(<ArtistsPage />);
    expect(screen.getByTestId("artists-navbar")).toBeInTheDocument();
  });

  it("renders the upload banner with usage text", () => {
    render(<ArtistsPage />);
    expect(screen.getByText("0% of uploads used")).toBeInTheDocument();
    expect(screen.getByText("0 of 180 minutes")).toBeInTheDocument();
  });

  it("renders the 'Get unlimited uploads' button", () => {
    render(<ArtistsPage />);
    expect(screen.getByText("Get unlimited uploads")).toBeInTheDocument();
  });

  it("renders the Artist Studio heading", () => {
    render(<ArtistsPage />);
    expect(screen.getByRole("heading", { name: /artist studio/i })).toBeInTheDocument();
  });

  it("renders the stats subtitle", () => {
    render(<ArtistsPage />);
    expect(screen.getByText("All time stats updated daily.")).toBeInTheDocument();
  });

  // ── Tabs ───────────────────────────────────────────────────────────────────

  it("renders all four tab buttons", () => {
    render(<ArtistsPage />);
    expect(screen.getByRole("button", { name: "SoundCloud Tracks" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Distribution" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vinyl Records" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Comments" })).toBeInTheDocument();
  });

  it("shows SoundCloud Tracks content by default", () => {
    render(<ArtistsPage />);
    expect(screen.getByPlaceholderText("Search tracks")).toBeInTheDocument();
  });

  it("switches to Distribution tab and shows placeholder", async () => {
    render(<ArtistsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Distribution" }));
    expect(await screen.findByText("Distribution content coming soon.")).toBeInTheDocument();
  });

  it("switches to Vinyl Records tab and shows placeholder", async () => {
    render(<ArtistsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Vinyl Records" }));
    expect(await screen.findByText("Vinyl Records content coming soon.")).toBeInTheDocument();
  });

  it("switches to Comments tab and shows placeholder", async () => {
    render(<ArtistsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Comments" }));
    expect(await screen.findByText("Comments content coming soon.")).toBeInTheDocument();
  });

  it("hides the track list when a non-tracks tab is active", async () => {
    render(<ArtistsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Distribution" }));
    expect(screen.queryByTestId("track-list")).not.toBeInTheDocument();
  });


  it("calls trackService.getUploadedTracks on mount", async () => {
     render(<ArtistsPage />);
    await waitFor(() =>
      expect(trackService.getUploadedTracks).toHaveBeenCalledTimes(1)
    );
  });

  it("renders all fetched tracks in the list", async () => {
    render(<ArtistsPage />);
    await waitFor(() =>
      expect(screen.getAllByTestId("track-row")).toHaveLength(sampleTracks.length)
    );
  });

  it("displays the correct track count after fetch", async () => {
    render(<ArtistsPage />);
    await waitFor(() =>
      expect(screen.getByText(`${sampleTracks.length} tracks`)).toBeInTheDocument()
    );
  });

  it("renders zero tracks when service returns empty array", async () => {
    vi.mocked(trackService.getUploadedTracks).mockResolvedValue([]);
    render(<ArtistsPage />);
    await waitFor(() =>
      expect(screen.getByText("0 tracks")).toBeInTheDocument()
    );
    expect(screen.queryByTestId("track-row")).not.toBeInTheDocument();
  });

  it("filters tracks by search query", async () => {
    render(<ArtistsPage />);
    await waitFor(() => screen.getAllByTestId("track-row"));

    fireEvent.change(screen.getByPlaceholderText("Search tracks"), {
      target: { value: "Alpha" },
    });

    await waitFor(() => {
      expect(screen.getAllByTestId("track-row")).toHaveLength(1);
      expect(screen.getByText("Alpha Track")).toBeInTheDocument();
    });
  });

 
  it("shows 0 tracks when search matches nothing", async () => {
    render(<ArtistsPage />);
    await waitFor(() => screen.getAllByTestId("track-row"));

    fireEvent.change(screen.getByPlaceholderText("Search tracks"), {
      target: { value: "zzznomatch" },
    });

    await waitFor(() => {
      expect(screen.getByText("0 tracks")).toBeInTheDocument();
      expect(screen.queryByTestId("track-row")).not.toBeInTheDocument();
    });
  });

  it("renders Public and Private filter buttons", () => {
    render(<ArtistsPage />);
    expect(screen.getByRole("button", { name: "Public" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Private" })).toBeInTheDocument();
  });

  it("filters to public tracks only when Public is clicked", async () => {
    render(<ArtistsPage />);
    await waitFor(() => screen.getAllByTestId("track-row"));

    fireEvent.click(screen.getByRole("button", { name: "Public" }));

    const publicTracks = sampleTracks.filter((t) => !t.isPrivate);
    await waitFor(() =>
      expect(screen.getAllByTestId("track-row")).toHaveLength(publicTracks.length)
    );
  });

  it("filters to private tracks only when Private is clicked", async () => {
    render(<ArtistsPage />);
    await waitFor(() => screen.getAllByTestId("track-row"));

    fireEvent.click(screen.getByRole("button", { name: "Private" }));

    const privateTracks = sampleTracks.filter((t) => t.isPrivate);
    await waitFor(() =>
      expect(screen.getAllByTestId("track-row")).toHaveLength(privateTracks.length)
    );
  });

  it("toggling Public twice resets to all tracks", async () => {
    render(<ArtistsPage />);
    await waitFor(() => screen.getAllByTestId("track-row"));

    const publicBtn = screen.getByRole("button", { name: "Public" });
    fireEvent.click(publicBtn);
    fireEvent.click(publicBtn);

    await waitFor(() =>
      expect(screen.getAllByTestId("track-row")).toHaveLength(sampleTracks.length)
    );
  });

  it("toggling Private twice resets to all tracks", async () => {
    render(<ArtistsPage />);
    await waitFor(() => screen.getAllByTestId("track-row"));

    const privateBtn = screen.getByRole("button", { name: "Private" });
    fireEvent.click(privateBtn);
    fireEvent.click(privateBtn);

    await waitFor(() =>
      expect(screen.getAllByTestId("track-row")).toHaveLength(sampleTracks.length)
    );
  });

  it("switching from Public to Private filter shows only private tracks", async () => {
    render(<ArtistsPage />);
    await waitFor(() => screen.getAllByTestId("track-row"));

    fireEvent.click(screen.getByRole("button", { name: "Public" }));
    fireEvent.click(screen.getByRole("button", { name: "Private" }));

    const privateTracks = sampleTracks.filter((t) => t.isPrivate);
    await waitFor(() =>
      expect(screen.getAllByTestId("track-row")).toHaveLength(privateTracks.length)
    );
  });

  it("renders all stat labels in the studio header", () => {
    render(<ArtistsPage />);
    expect(screen.getByText("SC plays")).toBeInTheDocument();
    expect(screen.getByText("Reposts")).toBeInTheDocument();
    expect(screen.getByText("Downloads")).toBeInTheDocument();
    expect(screen.getByText("Likes")).toBeInTheDocument();
  });

});

//npm run test -- src/features/track-management/tests/ArtistsPage.test.tsx