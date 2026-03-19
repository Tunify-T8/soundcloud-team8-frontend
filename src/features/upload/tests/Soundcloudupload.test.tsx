import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import SoundCloudUpload from "../pages/UploadPage"
import audioSourceReducer from "../../../store/AudioSourceSlice"

// ─── Setup ────────────────────────────────────────────────────────────────────

function makeStore(withSource = false) {
  const store = configureStore({ reducer: { audioSource: audioSourceReducer } })
  if (withSource) {
    store.dispatch({
      type: "audioSource/setAudioSource",
      payload: { kind: "file", url: "blob:mock", name: "track.mp3", size: 1024, mimeType: "audio/mp3" },
    })
  }
  return store
}

function renderPage(store = makeStore()) {
  return { ...render(<Provider store={store}><SoundCloudUpload /></Provider>), store }
}

beforeEach(() => {
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:mock-url"),
    revokeObjectURL: vi.fn(),
  })
  vi.stubGlobal("MediaRecorder", vi.fn().mockImplementation(() => ({
    state: "inactive", start: vi.fn(), pause: vi.fn(),
    resume: vi.fn(), stop: vi.fn(),
    ondataavailable: null, onstop: null,
  })))
  vi.stubGlobal("navigator", {
    mediaDevices: {
      getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }),
    },
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

// ─── Render: header ───────────────────────────────────────────────────────────

describe("SoundCloudUpload — renders correctly (header)", () => {
  it("renders Upload heading", () => {
    renderPage()
    expect(screen.getByText("Upload")).toBeInTheDocument()
  })

  it("renders logo link pointing to /", () => {
    renderPage()
    expect(screen.getAllByRole("link")[0]).toHaveAttribute("href", "/")
  })

  it("renders close button", () => {
    renderPage()
    const closeBtn = document.querySelector("button svg line[x1='18'][y1='6']")?.closest("button")
    expect(closeBtn).toBeInTheDocument()
  })
})

// ─── Render: progress bar ─────────────────────────────────────────────────────

describe("SoundCloudUpload — renders correctly (progress bar)", () => {
  it("shows 0% of uploads used", () => {
    renderPage()
    expect(screen.getByText("0% of uploads used")).toBeInTheDocument()
  })

  it("shows 0 of 120 minutes", () => {
    renderPage()
    expect(screen.getByText("0 of 120 minutes")).toBeInTheDocument()
  })

  it("renders Get unlimited uploads button", () => {
    renderPage()
    expect(screen.getByText("Get unlimited uploads")).toBeInTheDocument()
  })
})

// ─── Render: dropzone ─────────────────────────────────────────────────────────

describe("SoundCloudUpload — renders correctly (dropzone)", () => {
  it("renders the main heading", () => {
    renderPage()
    expect(screen.getByText("Upload your audio files.")).toBeInTheDocument()
  })

  it("renders drag-and-drop instruction", () => {
    renderPage()
    expect(screen.getByText("Drag and drop audio files to get started.")).toBeInTheDocument()
  })

  it("renders Choose files button", () => {
    renderPage()
    expect(screen.getByText("Choose files")).toBeInTheDocument()
  })

  it("renders quality hint text", () => {
    renderPage()
    expect(screen.getByText(/For best quality, use WAV/)).toBeInTheDocument()
  })

  it("renders hidden file input accepting audio/*", () => {
    const { container } = renderPage()
    const input = container.querySelector("input[type='file']") as HTMLInputElement
    expect(input.accept).toBe("audio/*")
  })
})

// ─── Render: mic recorder ─────────────────────────────────────────────────────

describe("SoundCloudUpload — renders correctly (recorder)", () => {
  it("renders the mic toggle from Recorder", () => {
    renderPage()
    expect(screen.getByText("Or record with a microphone")).toBeInTheDocument()
  })
})

// ─── Render: footer ───────────────────────────────────────────────────────────

describe("SoundCloudUpload — renders correctly (footer)", () => {
  it("renders all footer links", () => {
    renderPage()
    ;["Legal", "Privacy", "Cookie Policy", "Imprint", "About us", "Copyright", "Feedback"]
      .forEach(link => expect(screen.getByText(link)).toBeInTheDocument())
  })
})

// ─── Render: navigation ───────────────────────────────────────────────────────

describe("SoundCloudUpload — renders correctly (navigation)", () => {
  it("shows TrackInfoPage when a source is set", () => {
    renderPage(makeStore(true))
    expect(screen.getByText("Track info")).toBeInTheDocument()
  })

  it("does not show TrackInfoPage without a source", () => {
    renderPage()
    expect(screen.queryByText("Track info")).not.toBeInTheDocument()
  })
})

// ─── Interactions: dropzone ───────────────────────────────────────────────────

describe("SoundCloudUpload — interactions (dropzone)", () => {
  it("dragover adds orange border style", () => {
    const { container } = renderPage()
    const dropzone = container.querySelector("[class*='border-dashed']")!
    fireEvent.dragOver(dropzone)
    expect(dropzone.className).toMatch(/border-\[#ff5500\]/)
  })

  it("dragleave removes orange border style", () => {
    const { container } = renderPage()
    const dropzone = container.querySelector("[class*='border-dashed']")!
    fireEvent.dragOver(dropzone)
    fireEvent.dragLeave(dropzone)
    expect(dropzone.className).not.toMatch(/border-\[#ff5500\]/)
  })

  it("dropping a file dispatches setAudioSource with correct name", async () => {
    const store = makeStore()
    const { container } = renderPage(store)
    const dropzone = container.querySelector("[class*='border-dashed']")!
    const file = new File(["audio"], "dropped.wav", { type: "audio/wav" })
    await act(async () => {
      fireEvent.drop(dropzone, { dataTransfer: { files: [file] } })
    })
    expect((store.getState().audioSource.source as any)?.name).toBe("dropped.wav")
  })

  it("dropping no files does not dispatch", async () => {
    const store = makeStore()
    const { container } = renderPage(store)
    const dropzone = container.querySelector("[class*='border-dashed']")!
    const before = store.getState().audioSource.source
    await act(async () => {
      fireEvent.drop(dropzone, { dataTransfer: { files: [] } })
    })
    expect(store.getState().audioSource.source).toBe(before)
  })
})

// ─── Interactions: file input ─────────────────────────────────────────────────

describe("SoundCloudUpload — interactions (file input)", () => {
  it("selecting a file dispatches setAudioSource", async () => {
    const store = makeStore()
    const { container } = renderPage(store)
    const input = container.querySelector("input[type='file']") as HTMLInputElement
    const file = new File(["audio"], "song.mp3", { type: "audio/mpeg" })
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } })
    })
    expect(store.getState().audioSource.source?.kind).toBe("file")
    expect((store.getState().audioSource.source as any)?.name).toBe("song.mp3")
  })

  it("selecting no file does not dispatch", async () => {
    const store = makeStore()
    const { container } = renderPage(store)
    const input = container.querySelector("input[type='file']") as HTMLInputElement
    const before = store.getState().audioSource.source
    await act(async () => {
      fireEvent.change(input, { target: { files: [] } })
    })
    expect(store.getState().audioSource.source).toBe(before)
  })

  it("dispatches correct mimeType from file input", async () => {
    const store = makeStore()
    const { container } = renderPage(store)
    const input = container.querySelector("input[type='file']") as HTMLInputElement
    const file = new File(["audio"], "track.flac", { type: "audio/flac" })
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } })
    })
    expect((store.getState().audioSource.source as any)?.mimeType).toBe("audio/flac")
  })
})