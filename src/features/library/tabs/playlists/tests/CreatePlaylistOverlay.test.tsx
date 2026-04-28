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

  it("adds track to existing playlist", async () => {
    mockedPlaylistService.getMyCollections.mockResolvedValue({
      data: [{ id: "pl-1", title: "My Playlist", trackCount: 2 }],
    } as any);
    mockedPlaylistService.addTrack.mockResolvedValue(true as never);

    render(
      <CreatePlaylistOverlay isOpen onClose={vi.fn()} track={baseTrack} />,
    );

    expect(await screen.findByText("Add to playlist")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: /add to playlist/i })[1]);

    await waitFor(() => {
      expect(mockedPlaylistService.addTrack).toHaveBeenCalledWith("pl-1", {
        trackId: "track-1",
      });
    });
  });

  it("creates a playlist and auto-adds the track", async () => {
    mockedPlaylistService.getMyCollections.mockResolvedValue({ data: [] } as any);
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

    const titleInput = (await screen.findAllByRole("textbox"))[0];
    fireEvent.change(titleInput, { target: { value: "Road Mix" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockedPlaylistService.createCollection).toHaveBeenCalled();
      expect(mockedPlaylistService.addTrack).toHaveBeenCalledWith("pl-new", {
        trackId: "track-1",
      });
    });
  });
});
