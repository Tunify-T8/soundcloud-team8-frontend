import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";

import SoundCloudUpload from "../pages/UploadPage";
import audioSourceReducer from "../../../store/AudioSourceSlice";

vi.mock("@/features/premium/components/ArtistModal", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <button onClick={onClose}>Close artist modal</button>
  ),
}));

vi.mock("../components/UploadQuotaBanner", () => ({
  default: ({ onOpenDetails }: { onOpenDetails: () => void }) => (
    <button onClick={onOpenDetails}>Open quota details</button>
  ),
}));

vi.mock("../components/UploadLimitScreen", () => ({
  default: () => <div>Upload limit screen</div>,
}));

vi.mock("../components/Recorder", () => ({
  default: () => <div>Or record with a microphone</div>,
}));

vi.mock("../components/TrackInfo", () => ({
  default: () => <div>Track info</div>,
}));

vi.mock("@/features/premium/components/SubscriptionBadge", () => ({
  default: () => <div>Subscription badge</div>,
}));

vi.mock("@/features/track-management/trackService", () => ({
  trackService: {
    getUploadedTracks: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/hooks/useSubscription", () => ({
  useSubscription: () => ({
    tier: "free",
    isArtistPro: false,
  }),
}));

function makeStore(withSource = false) {
  const store = configureStore({ reducer: { audioSource: audioSourceReducer } });
  if (withSource) {
    store.dispatch({
      type: "audioSource/setAudioSource",
      payload: {
        kind: "file",
        url: "blob:mock",
        name: "track.mp3",
        size: 1024,
        mimeType: "audio/mp3",
      },
    });
  }
  return store;
}

function renderPage(store = makeStore()) {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <SoundCloudUpload />
      </MemoryRouter>
    </Provider>,
  );
}

beforeEach(() => {
  vi.stubGlobal("MediaRecorder", vi.fn().mockImplementation(() => ({
    state: "inactive",
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
    ondataavailable: null,
    onstop: null,
  })));
  vi.stubGlobal("navigator", {
    mediaDevices: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
    },
  });
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("SoundCloudUpload", () => {
  it("renders the upload shell when no source is selected", async () => {
    renderPage();

    expect(screen.getByText("Upload")).toBeInTheDocument();
    expect(screen.getByText("Upload your audio files.")).toBeInTheDocument();
    expect(screen.getByText("Choose files")).toBeInTheDocument();
    expect(screen.getByText("Or record with a microphone")).toBeInTheDocument();
    expect(await screen.findByText("Open quota details")).toBeInTheDocument();
  });

  it("shows the track info step when an audio source is already selected", () => {
    renderPage(makeStore(true));

    expect(screen.getByText("Track info")).toBeInTheDocument();
    expect(screen.queryByTestId("upload-page")).not.toBeInTheDocument();
  });

  it("dispatches an audio source when a file is selected", async () => {
    const store = makeStore();
    renderPage(store);

    const input = screen.getByTestId("upload-file-input");
    const file = new File(["audio"], "song.mp3", { type: "audio/mpeg" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(store.getState().audioSource.source?.kind).toBe("file");
    });
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(store.getState().audioSource.source).toMatchObject({
      name: "song.mp3",
      mimeType: "audio/mpeg",
    });
  });

  it("dispatches an audio source when a file is dropped", async () => {
    const store = makeStore();
    renderPage(store);

    const dropzone = screen.getByTestId("upload-dropzone");
    const file = new File(["audio"], "dropped.wav", { type: "audio/wav" });
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });

    await waitFor(() => {
      expect(store.getState().audioSource.source).toMatchObject({
        name: "dropped.wav",
        mimeType: "audio/wav",
      });
    });
  });

  it("opens the upgrade details modal from the quota banner", async () => {
    renderPage();

    fireEvent.click(await screen.findByText("Open quota details"));
    expect(screen.getByText("Close artist modal")).toBeInTheDocument();
  });
});
