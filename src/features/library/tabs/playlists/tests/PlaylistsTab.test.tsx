import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import PlaylistsTab from "../pages/PlaylistsTab";
import { playlistService } from "../../../libraryService";
import type { CollectionPreview } from "../../../types";

vi.mock("../../../libraryService", () => ({
  playlistService: {
    getMyCollections: vi.fn(),
  },
}));

const mockedPlaylistService = vi.mocked(playlistService);

function makePlaylist(
  overrides: Partial<CollectionPreview> = {},
): CollectionPreview {
  return {
    id: overrides.id ?? "pl-1",
    title: overrides.title ?? "Road Trip",
    description: null,
    type: "PLAYLIST",
    privacy: "public",
    coverUrl: overrides.coverUrl ?? "https://img.test/cover.jpg",
    trackCount: overrides.trackCount ?? 3,
    likeCount: 0,
    repostsCount: 0,
    isLiked: overrides.isLiked ?? false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("PlaylistsTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders playlist cards from service response", async () => {
    mockedPlaylistService.getMyCollections.mockResolvedValue({
      data: [makePlaylist({ id: "pl-1", title: "Road Trip" })],
    } as any);

    render(
      <MemoryRouter>
        <PlaylistsTab />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Road Trip")).toBeInTheDocument();
    const cardLink = screen.getByRole("link", { name: /road trip/i });
    expect(cardLink).toHaveAttribute("href", "/collections/pl-1");
  });

  it("filters playlists by search query", async () => {
    mockedPlaylistService.getMyCollections.mockResolvedValue({
      data: [
        makePlaylist({ id: "pl-1", title: "Road Trip" }),
        makePlaylist({ id: "pl-2", title: "Focus Beats" }),
      ],
    } as any);

    render(
      <MemoryRouter>
        <PlaylistsTab />
      </MemoryRouter>,
    );

    await screen.findByText("Road Trip");
    fireEvent.change(screen.getByTestId("playlists-filter-input"), {
      target: { value: "focus" },
    });

    expect(screen.getByText("Focus Beats")).toBeInTheDocument();
    expect(screen.queryByText("Road Trip")).not.toBeInTheDocument();
  });

  it("shows empty message when no playlists exist", async () => {
    mockedPlaylistService.getMyCollections.mockResolvedValue({
      data: [],
    } as any);

    render(
      <MemoryRouter>
        <PlaylistsTab />
      </MemoryRouter>,
    );

    expect(await screen.findByTestId("playlists-empty")).toHaveTextContent(
      "You have no playlists yet",
    );
  });

  it("supports liked filter option", async () => {
    mockedPlaylistService.getMyCollections.mockResolvedValue({
      data: [
        makePlaylist({ id: "pl-1", title: "My Created", isLiked: false }),
        makePlaylist({ id: "pl-2", title: "Liked One", isLiked: true }),
      ],
    } as any);

    render(
      <MemoryRouter>
        <PlaylistsTab />
      </MemoryRouter>,
    );

    await screen.findByText("My Created");
    fireEvent.click(screen.getByTestId("playlists-filter-dropdown-btn"));
    fireEvent.click(screen.getByTestId("playlists-filter-opt-liked"));

    await waitFor(() => {
      expect(screen.getByText("Liked One")).toBeInTheDocument();
      expect(screen.queryByText("My Created")).not.toBeInTheDocument();
    });
  });
});
