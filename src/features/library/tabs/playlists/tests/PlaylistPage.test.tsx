import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import PlaylistPage from "../pages/PlaylistPage";
import audioSourceReducer from "@/store/AudioSourceSlice";
import userReducer from "@/store/userSlice";
import queueReducer from "@/store/queueSlice";
import playContextReducer from "@/store/playContextSlice";

const mockNavigate = vi.fn();
const mockGetPlaylistById = vi.fn();
const mockGetPlaylistTracks = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/features/playerUI/context/usePlayer", () => ({
  usePlayer: () => ({
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    setCurrentTrack: vi.fn(),
    setIsPlaying: vi.fn(),
    requestSeek: vi.fn(),
  }),
}));

vi.mock("@/hooks/usePlayContext", () => ({
  usePlayContext: vi.fn(),
}));

vi.mock("../../../libraryService", () => ({
  playlistService: {
    getPlaylistById: (...args: unknown[]) => mockGetPlaylistById(...args),
    getPlaylistTracks: (...args: unknown[]) => mockGetPlaylistTracks(...args),
    getPlaylistByToken: vi.fn(),
    reorderTracks: vi.fn(),
  },
}));

vi.mock("@/features/profile/profileService", () => ({
  profileService: {
    getFollowStatus: vi.fn().mockResolvedValue({ isFollowing: false }),
    followUser: vi.fn(),
    unfollowUser: vi.fn(),
  },
}));

vi.mock("../components/PlaylistHeader", () => ({
  default: ({ playlist }: { playlist: { title: string } }) => <div data-testid="playlist-header">{playlist.title}</div>,
}));

vi.mock("../components/TrackList", () => ({
  default: ({ tracks }: { tracks: Array<unknown> }) => <div data-testid="playlist-track-list">{tracks.length}</div>,
}));

vi.mock("../components/ActionBar", () => ({
  default: ({ onDeleted }: { onDeleted: () => void }) => (
    <button onClick={onDeleted}>Delete playlist</button>
  ),
}));

vi.mock("../components/EditPlaylistOverlay", () => ({
  default: () => null,
}));

describe("PlaylistPage", () => {
  function renderPlaylistPage(currentUserId = "owner-1") {
    const store = configureStore({
      reducer: {
        audioSource: audioSourceReducer,
        user: userReducer,
        queue: queueReducer,
        playContext: playContextReducer,
      },
      preloadedState: {
        user: {
          currentUser: {
            id: currentUserId,
            username: "alice",
            email: "alice@example.com",
            role: "listener",
            isVerified: true,
            avatarUrl: null,
          },
        },
      },
    });

    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/collections/pl-1"]}>
          <Routes>
            <Route path="/collections/:id" element={<PlaylistPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );
  }

  beforeEach(() => {
    mockNavigate.mockReset();
    mockGetPlaylistById.mockReset();
    mockGetPlaylistTracks.mockReset();
  });

  it("shows an error when the playlist cannot be loaded", async () => {
    mockGetPlaylistById.mockResolvedValue(null);
    mockGetPlaylistTracks.mockResolvedValue({ data: [] });

    renderPlaylistPage();

    expect(await screen.findByText(/collection not found/i)).toBeInTheDocument();
  });

  it("renders playlist content after loading", async () => {
    mockGetPlaylistById.mockResolvedValue({
      id: "pl-1",
      title: "My Playlist",
      privacy: "public",
      owner: {
        id: "owner-1",
        username: "alice",
        displayName: "Alice",
        avatarUrl: null,
        followerCount: 10,
      },
    });
    mockGetPlaylistTracks.mockResolvedValue({
      data: [{ track: { id: "t-1" } }],
    });

    renderPlaylistPage();

    expect(await screen.findByTestId("playlist-header")).toHaveTextContent("My Playlist");
    expect(screen.getByTestId("playlist-track-list")).toHaveTextContent("1");
  });

  it("navigates back to the library after deletion", async () => {
    mockGetPlaylistById.mockResolvedValue({
      id: "pl-1",
      title: "My Playlist",
      privacy: "public",
      owner: {
        id: "owner-1",
        username: "alice",
        displayName: "Alice",
        avatarUrl: null,
        followerCount: 10,
      },
    });
    mockGetPlaylistTracks.mockResolvedValue({ data: [] });

    renderPlaylistPage();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /delete playlist/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /delete playlist/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/library");
  });
});
