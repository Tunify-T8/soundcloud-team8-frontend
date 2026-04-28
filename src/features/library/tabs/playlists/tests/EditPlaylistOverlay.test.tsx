import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import EditPlaylistOverlay from "../components/EditPlaylistOverlay";
import { playlistService } from "../../../libraryService";
import type { Collection, CollectionTrack } from "../../../types";

vi.mock("../../../libraryService", () => ({
  playlistService: {
    updateCollection: vi.fn(),
    removeTrack: vi.fn(),
  },
}));

const mockedPlaylistService = vi.mocked(playlistService);

function makePlaylist(overrides: Partial<Collection> = {}): Collection {
  return {
    id: "pl-1",
    title: "Original Title",
    description: "old desc",
    type: "PLAYLIST",
    privacy: "public",
    coverUrl: null,
    trackCount: 1,
    likeCount: 0,
    repostsCount: 0,
    isLiked: false,
    owner: {
      id: "u-1",
      username: "alice",
      displayName: "Alice",
      avatarUrl: null,
      followerCount: 0,
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeTracks(): CollectionTrack[] {
  return [
    {
      position: 1,
      addedAt: "2026-01-01T00:00:00.000Z",
      track: {
        id: "t-1",
        title: "First Track",
        durationSeconds: 120,
        coverUrl: null,
        genreId: null,
        isPublic: true,
        user: {
          id: "u-1",
          username: "alice",
          displayName: "Alice",
          avatarUrl: null,
          followerCount: 0,
        },
      },
    },
  ];
}

describe("EditPlaylistOverlay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when closed", () => {
    render(
      <EditPlaylistOverlay
        isOpen={false}
        playlist={makePlaylist()}
        tracks={makeTracks()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByText(/basic info/i)).not.toBeInTheDocument();
  });

  it("saves changed title and calls onSaved/onClose", async () => {
    mockedPlaylistService.updateCollection.mockResolvedValue({ id: "pl-1" } as never);
    const onSaved = vi.fn();
    const onClose = vi.fn();

    render(
      <EditPlaylistOverlay
        isOpen
        playlist={makePlaylist()}
        tracks={makeTracks()}
        onClose={onClose}
        onSaved={onSaved}
      />,
    );

    const titleInput = screen.getByDisplayValue("Original Title");
    fireEvent.change(titleInput, { target: { value: "Updated Title" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockedPlaylistService.updateCollection).toHaveBeenCalledWith("pl-1", {
        title: "Updated Title",
      });
      expect(onSaved).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("removes track from tracks tab", async () => {
    mockedPlaylistService.removeTrack.mockResolvedValue(true as never);

    render(
      <EditPlaylistOverlay
        isOpen
        playlist={makePlaylist()}
        tracks={makeTracks()}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /tracks/i }));
    expect(await screen.findByText("First Track")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /remove first track from playlist/i }));

    await waitFor(() => {
      expect(mockedPlaylistService.removeTrack).toHaveBeenCalledWith("pl-1", {
        trackId: "t-1",
      });
      expect(screen.queryByText("First Track")).not.toBeInTheDocument();
    });
  });
});
