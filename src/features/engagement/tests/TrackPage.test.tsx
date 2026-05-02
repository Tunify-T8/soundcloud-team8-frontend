import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import audioSourceReducer from "@/store/AudioSourceSlice";
import userReducer from "@/store/userSlice";
import queueReducer from "@/store/queueSlice";
import playContextReducer from "@/store/playContextSlice";

vi.mock("@/features/admin/components/AdminIDDisplay", () => ({
  default: ({ id }: { id: string }) => <div data-testid="admin-id-display">{id}</div>,
  AdminIDDisplay: ({ id }: { id: string }) => <div data-testid="admin-id-display">{id}</div>,
}));

vi.mock("@/features/engagement/services/engagementService", () => ({
  engagementService: {
    getTrackDetails: vi.fn(),
    getTrackComments: vi.fn(),
    getEngagement: vi.fn().mockResolvedValue({
      likes: 0,
      reposts: 0,
      comments: 0,
      plays: 0,
    }),
  },
}));

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

vi.mock("@/features/engagement/hooks/useEngagement", () => ({
  useEngagement: () => ({
    counts: { likes: 0, reposts: 0, plays: 0, comments: 0 },
    isLiked: false,
    isReposted: false,
    loading: false,
    toggleLike: vi.fn(),
    toggleRepost: vi.fn(),
  }),
}));

vi.mock("@/features/auth/services/api", () => ({
  api: {
    get: vi.fn().mockResolvedValue({
      data: { isFollowing: false, followersCount: 0 },
    }),
    post: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
}));

import TrackPage from "../pages/TrackPage";
import { engagementService } from "@/features/engagement/services/engagementService";

function renderTrackPage() {
  const store = configureStore({
    reducer: {
      audioSource: audioSourceReducer,
      user: userReducer,
      queue: queueReducer,
      playContext: playContextReducer,
    },
  });

  return (
    <Provider store={store}>
      <MemoryRouter initialEntries={["/tracks/1"]}>
        <Routes>
          <Route path="/tracks/:trackId" element={<TrackPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe("TrackPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the fetched track details", async () => {
    vi.mocked(engagementService.getTrackDetails).mockResolvedValue({
      id: "1",
      title: "test",
      artists: [{ id: "a1", name: "artist" }],
      durationSeconds: 120,
      createdAt: "",
      plays: 0,
      artworkUrl: "",
      audioUrl: "",
    } as never);

    vi.mocked(engagementService.getTrackComments).mockResolvedValue({
      comments: [],
    } as never);

    render(renderTrackPage());

    expect(await screen.findByText("test")).toBeInTheDocument();
    expect(screen.getAllByText("artist").length).toBeGreaterThan(0);
    expect(engagementService.getTrackDetails).toHaveBeenCalledWith("1");
  });
});
