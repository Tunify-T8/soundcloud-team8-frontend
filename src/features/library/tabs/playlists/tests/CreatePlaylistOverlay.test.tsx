import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import CreatePlaylistOverlay from "../components/CreatePlaylistOverlay";
import { playlistService } from "../../../libraryService";

vi.mock("../../../libraryService", () => ({
  playlistService: {
    getMyCollections: vi.fn(),
    addTrack: vi.fn(),
    createCollection: vi.fn(),
  },
}));

const mockedPlaylistService = vi.mocked(playlistService);

const baseTrack = {
  id: "track-1",
  title: "Night Shift",
  artist: "Alice",
  coverUrl: "https://img.test/night.jpg",
};

describe("CreatePlaylistOverlay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when closed", () => {
    render(
      <CreatePlaylistOverlay isOpen={false} onClose={vi.fn()} track={baseTrack} />,
    );

    expect(screen.queryByText(/create a playlist/i)).not.toBeInTheDocument();
  });

  it("adds a track to an existing playlist", async () => {
    mockedPlaylistService.getMyCollections.mockResolvedValue({
      data: [{ id: "pl-1", title: "My Playlist", trackCount: 2 }],
    } as never);
    mockedPlaylistService.addTrack.mockResolvedValue(true as never);

    render(
      <CreatePlaylistOverlay
        isOpen
        onClose={vi.fn()}
        track={baseTrack}
        autoAddTrackId="track-1"
      />,
    );

    expect(await screen.findByText("My Playlist")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(mockedPlaylistService.addTrack).toHaveBeenCalledWith("pl-1", {
        trackId: "track-1",
      });
    });
  });

  it("creates a playlist and auto-adds the selected track", async () => {
    mockedPlaylistService.getMyCollections.mockResolvedValue({ data: [] } as never);
    mockedPlaylistService.createCollection.mockResolvedValue({ id: "pl-new" } as never);
    mockedPlaylistService.addTrack.mockResolvedValue(true as never);

    render(
      <CreatePlaylistOverlay
        isOpen
        onClose={vi.fn()}
        track={baseTrack}
        autoAddTrackId="track-1"
      />,
    );

    const titleInput = screen.getAllByRole("textbox")[0];
    fireEvent.change(titleInput, { target: { value: "Road Mix" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockedPlaylistService.createCollection).toHaveBeenCalledWith({
        title: "Road Mix",
        type: "PLAYLIST",
        privacy: "public",
        description: undefined,
        coverUrl: undefined,
      });
      expect(mockedPlaylistService.addTrack).toHaveBeenCalledWith("pl-new", {
        trackId: "track-1",
      });
    });
  });
});
