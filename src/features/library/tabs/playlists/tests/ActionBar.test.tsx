import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ActionBar from "../components/ActionBar";
import { playlistService } from "../../../libraryService";
import type { Collection } from "../../../types";

vi.mock("../../../libraryService", () => ({
  playlistService: {
    likePlaylist: vi.fn(),
    unlikePlaylist: vi.fn(),
    deletePlaylist: vi.fn(),
  },
}));

const mockedPlaylistService = vi.mocked(playlistService);

function makePlaylist(overrides: Partial<Collection> = {}): Collection {
  return {
    id: "pl-1",
    title: "My Playlist",
    description: null,
    type: "PLAYLIST",
    privacy: "public",
    coverUrl: null,
    trackCount: 0,
    likeCount: 1,
    repostsCount: 2,
    isLiked: false,
    owner: {
      id: "owner-1",
      username: "owner",
      displayName: "Owner",
      avatarUrl: null,
      followerCount: 0,
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("Playlist ActionBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("likes playlist and increments visible likes count", async () => {
    mockedPlaylistService.likePlaylist.mockResolvedValue(true as never);

    render(<ActionBar playlist={makePlaylist()} />);

    const likeButton = screen.getByTitle("Like");
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(mockedPlaylistService.likePlaylist).toHaveBeenCalledWith("pl-1");
      expect(screen.getByTitle("Unlike")).toBeInTheDocument();
    });
  });

  it("deletes playlist and calls onDeleted when allowed", async () => {
    mockedPlaylistService.deletePlaylist.mockResolvedValue(true as never);
    const onDeleted = vi.fn();

    render(<ActionBar playlist={makePlaylist()} canDelete onDeleted={onDeleted} />);

    fireEvent.click(screen.getByTitle("Delete Playlist"));

    await waitFor(() => {
      expect(mockedPlaylistService.deletePlaylist).toHaveBeenCalledWith("pl-1");
      expect(onDeleted).toHaveBeenCalledTimes(1);
    });
  });
});
