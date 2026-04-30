import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PlaylistPage from "../pages/PlaylistPage";
import { playlistService } from "../../../libraryService";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "pl-1" }),
  useNavigate: () => mockNavigate,
}));

vi.mock("react-redux", () => ({
  useSelector: (selector: any) =>
    selector({ user: { currentUser: { id: "owner-1" } } }),
}));

vi.mock("../../../libraryService", () => ({
  playlistService: {
    getPlaylistById: vi.fn(),
    getPlaylistTracks: vi.fn(),
  },
}));

vi.mock("../components/PlaylistHeader", () => ({
  default: ({ isMe }: { isMe?: boolean }) => (
    <div data-testid="playlist-header">{isMe ? "owner-view" : "viewer-view"}</div>
  ),
}));

vi.mock("../components/TrackList", () => ({
  default: ({ tracks }: { tracks: unknown[] }) => (
    <div data-testid="playlist-track-list">tracks:{tracks.length}</div>
  ),
}));

vi.mock("../components/ActionBar", () => ({
  default: ({
    canDelete,
    onDeleted,
  }: {
    canDelete?: boolean;
    onDeleted?: () => void;
  }) => (
    <div data-testid="playlist-action-bar">
      <span>{canDelete ? "can-delete" : "cannot-delete"}</span>
      <button onClick={onDeleted}>trigger-delete</button>
    </div>
  ),
}));

vi.mock("../components/EditPlaylistOverlay", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="edit-overlay-open" /> : null,
}));

const mockedPlaylistService = vi.mocked(playlistService);

describe("PlaylistPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders collection-not-found when playlist is missing", async () => {
    mockedPlaylistService.getPlaylistById.mockResolvedValue(null as never);
    mockedPlaylistService.getPlaylistTracks.mockResolvedValue({ data: [] } as never);

    render(<PlaylistPage />);

    expect(await screen.findByText(/collection not found/i)).toBeInTheDocument();
  });

  it("renders playlist content for owner", async () => {
    mockedPlaylistService.getPlaylistById.mockResolvedValue({
      id: "pl-1",
      title: "My List",
      description: null,
      type: "PLAYLIST",
      privacy: "public",
      coverUrl: null,
      trackCount: 1,
      likeCount: 0,
      repostsCount: 0,
      isLiked: false,
      owner: {
        id: "owner-1",
        username: "alice",
        displayName: "Alice",
        avatarUrl: null,
        followerCount: 10,
      },
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    } as never);
    mockedPlaylistService.getPlaylistTracks.mockResolvedValue({
      data: [{ track: { id: "t-1" } }],
    } as never);

    render(<PlaylistPage />);

    await waitFor(() => {
      expect(screen.getByTestId("playlist-header")).toHaveTextContent("owner-view");
      expect(screen.getByTestId("playlist-action-bar")).toHaveTextContent("can-delete");
      expect(screen.getByTestId("playlist-track-list")).toHaveTextContent("tracks:1");
    });
  });

  it("navigates to library after delete callback", async () => {
    mockedPlaylistService.getPlaylistById.mockResolvedValue({
      id: "pl-1",
      title: "My List",
      description: null,
      type: "PLAYLIST",
      privacy: "public",
      coverUrl: null,
      trackCount: 0,
      likeCount: 0,
      repostsCount: 0,
      isLiked: false,
      owner: {
        id: "owner-1",
        username: "alice",
        displayName: "Alice",
        avatarUrl: null,
        followerCount: 10,
      },
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    } as never);
    mockedPlaylistService.getPlaylistTracks.mockResolvedValue({ data: [] } as never);

    render(<PlaylistPage />);
    await screen.findByTestId("playlist-action-bar");

    fireEvent.click(screen.getByRole("button", { name: "trigger-delete" }));
    expect(mockNavigate).toHaveBeenCalledWith("/library");
  });
});
