import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import TrackInfoPage from "../components/TrackInfo";
import audioSourceReducer from "../../../store/AudioSourceSlice";

vi.mock("axios", () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: new Blob(["audio"], { type: "audio/mpeg" }),
    }),
  },
}));

vi.mock("@/features/auth/services/api", () => ({
  api: {
    post: vi.fn(),
  },
}));

vi.mock("@/features/profile/profileService", () => ({
  profileService: {
    getMeProfile: vi.fn().mockResolvedValue({
      id: "me-1",
      username: "nada",
      email: "nada@example.com",
      avatarUrl: null,
      isCertified: true,
    }),
  },
}));

vi.mock("@/features/playerUI/context/usePlayer", () => ({
  usePlayer: () => ({
    currentTrack: null,
  }),
}));

function makeStore() {
  const store = configureStore({
    reducer: {
      audioSource: audioSourceReducer,
    },
  });

  store.dispatch({
    type: "audioSource/setAudioSource",
    payload: {
      kind: "file",
      url: "blob:track-info",
      name: "my-track.mp3",
      size: 1024,
      mimeType: "audio/mpeg",
    },
  });

  return store;
}

function renderPage() {
  return render(
    <Provider store={makeStore()}>
      <TrackInfoPage />
    </Provider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("TrackInfoPage", () => {
  it("renders the current upload metadata and prefilled title", async () => {
    renderPage();

    expect(screen.getByText("Track info")).toBeInTheDocument();
    expect(screen.getByText("my-track.mp3")).toBeInTheDocument();
    expect(screen.getByDisplayValue("my-track")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByDisplayValue("nada")).toBeInTheDocument();
    });
  });

  it("expands Advanced details when its section header is clicked", async () => {
    renderPage();
    await screen.findByDisplayValue("nada");

    fireEvent.click(screen.getByTestId("advanced-details-toggle"));

    expect(screen.getByText("Buy link")).toBeInTheDocument();
  });

  it("expands Permissions and shows the geoblocking options", async () => {
    renderPage();
    await screen.findByDisplayValue("nada");

    fireEvent.click(screen.getByTestId("permissions-toggle"));

    expect(screen.getByText("Enable direct downloads")).toBeInTheDocument();
    expect(screen.getByLabelText("Worldwide")).toBeInTheDocument();
    expect(screen.getByLabelText("Exclusive regions")).toBeInTheDocument();
    expect(screen.getByLabelText("Blocked regions")).toBeInTheDocument();
  });

  it("allows switching the privacy selection", async () => {
    renderPage();
    await screen.findByDisplayValue("nada");

    fireEvent.click(screen.getByLabelText("Private"));

    expect(screen.getByLabelText<HTMLInputElement>("Private").checked).toBe(
      true,
    );
  });
});
