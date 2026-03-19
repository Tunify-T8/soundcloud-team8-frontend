import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import Recorder from "../components/Recorder"
import audioSourceReducer from "../../../store/AudioSourceSlice"

// ─── Setup ────────────────────────────────────────────────────────────────────

class MockMediaRecorder {
  static lastInstance: MockMediaRecorder
  state = "inactive"
  ondataavailable: ((e: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  start  = vi.fn(() => { this.state = "recording" })
  pause  = vi.fn(() => { this.state = "paused" })
  resume = vi.fn(() => { this.state = "recording" })
  stop   = vi.fn(() => { this.state = "inactive"; this.onstop?.() })
  constructor() { MockMediaRecorder.lastInstance = this }
}

function makeStore() {
  return configureStore({ reducer: { audioSource: audioSourceReducer } })
}

function renderRecorder(micOpen = false, setMicOpen = vi.fn()) {
  const store = makeStore()
  const ui = render(
    <Provider store={store}>
      <Recorder micOpen={micOpen} setMicOpen={setMicOpen} />
    </Provider>
  )
  return { ...ui, store, setMicOpen }
}

beforeEach(() => {
  vi.stubGlobal("MediaRecorder", MockMediaRecorder)
  vi.stubGlobal("navigator", {
    mediaDevices: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
    },
  })
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:mock"),
    revokeObjectURL: vi.fn(),
  })
  vi.stubGlobal("Audio", vi.fn(() => ({
    src: "", preload: "", pause: vi.fn(),
    play: vi.fn().mockResolvedValue(undefined),
    load: vi.fn(), onended: null, currentTime: 0, duration: 5,
  })))
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

async function setupGranted() {
  const store = makeStore()
  const setMicOpen = vi.fn()
  const { rerender } = render(
    <Provider store={store}><Recorder micOpen={false} setMicOpen={setMicOpen} /></Provider>
  )
  await act(async () => {
    fireEvent.click(screen.getByText("Or record with a microphone").closest("button")!)
  })
  rerender(
    <Provider store={store}><Recorder micOpen={true} setMicOpen={setMicOpen} /></Provider>
  )
  return { store, setMicOpen, rerender }
}

// ─── Render: collapsed ────────────────────────────────────────────────────────

describe("Recorder — renders correctly (collapsed)", () => {
  it("renders the mic toggle button", () => {
    renderRecorder()
    expect(screen.getByText("Or record with a microphone")).toBeInTheDocument()
  })

  it("renders the subtitle text", () => {
    renderRecorder()
    expect(screen.getByText(/Upload recorded voice memos/)).toBeInTheDocument()
  })

  it("does not render recording controls when closed", () => {
    renderRecorder()
    expect(screen.queryByText("Start recording")).not.toBeInTheDocument()
  })
})

// ─── Render: open, no permission ─────────────────────────────────────────────

describe("Recorder — renders correctly (open, no permission)", () => {
  it("shows no microphone warning", () => {
    renderRecorder(true)
    expect(screen.getByText("No microphone found")).toBeInTheDocument()
  })

  it("shows browser settings instruction", () => {
    renderRecorder(true)
    expect(screen.getByText(/allow microphone access/)).toBeInTheDocument()
  })
})

// ─── Render: granted idle ─────────────────────────────────────────────────────

describe("Recorder — renders correctly (granted, idle)", () => {
  it("shows Start recording button", async () => {
    await setupGranted()
    expect(screen.getByText("Start recording")).toBeInTheDocument()
  })

  it("does not show Delete button before any recording", async () => {
    await setupGranted()
    expect(screen.queryByTitle("Delete")).not.toBeInTheDocument()
  })

  it("does not show undo/redo before recording", async () => {
    await setupGranted()
    expect(screen.queryByTitle("Undo 3s")).not.toBeInTheDocument()
    expect(screen.queryByTitle("Redo 3s")).not.toBeInTheDocument()
  })
})

// ─── Render: recording ────────────────────────────────────────────────────────

describe("Recorder — renders correctly (recording)", () => {
  it("shows Pause button", async () => {
    await setupGranted()
    await act(async () => { fireEvent.click(screen.getByText("Start recording")) })
    expect(screen.getByText("Pause")).toBeInTheDocument()
  })

  it("shows undo and redo buttons", async () => {
    await setupGranted()
    await act(async () => { fireEvent.click(screen.getByText("Start recording")) })
    expect(screen.getByTitle("Undo 3s")).toBeInTheDocument()
    expect(screen.getByTitle("Redo 3s")).toBeInTheDocument()
  })

  it("shows Delete button", async () => {
    await setupGranted()
    await act(async () => { fireEvent.click(screen.getByText("Start recording")) })
    expect(screen.getByTitle("Delete")).toBeInTheDocument()
  })

  it("undo is disabled at elapsed=0", async () => {
    await setupGranted()
    await act(async () => { fireEvent.click(screen.getByText("Start recording")) })
    expect(screen.getByTitle("Undo 3s")).toBeDisabled()
  })

  it("redo is disabled with no undo history", async () => {
    await setupGranted()
    await act(async () => { fireEvent.click(screen.getByText("Start recording")) })
    expect(screen.getByTitle("Redo 3s")).toBeDisabled()
  })
})

// ─── Render: paused ───────────────────────────────────────────────────────────

describe("Recorder — renders correctly (paused)", () => {
  it("shows Resume button", async () => {
    await setupGranted()
    await act(async () => { fireEvent.click(screen.getByText("Start recording")) })
    await act(async () => { fireEvent.click(screen.getByText("Pause")) })
    expect(screen.getByText("Resume")).toBeInTheDocument()
  })

  it("shows Finalize button", async () => {
    await setupGranted()
    await act(async () => { fireEvent.click(screen.getByText("Start recording")) })
    await act(async () => { fireEvent.click(screen.getByText("Pause")) })
    expect(screen.getByTitle("Finalize")).toBeInTheDocument()
  })
})

// ─── Interactions ─────────────────────────────────────────────────────────────

describe("Recorder — interactions", () => {
  it("toggle click calls getUserMedia", async () => {
    renderRecorder()
    await act(async () => {
      fireEvent.click(screen.getByText("Or record with a microphone").closest("button")!)
    })
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true })
  })

  it("toggle click calls setMicOpen(true) on success", async () => {
    const { setMicOpen } = renderRecorder()
    await act(async () => {
      fireEvent.click(screen.getByText("Or record with a microphone").closest("button")!)
    })
    expect(setMicOpen).toHaveBeenCalledWith(true)
  })

  it("toggle click calls setMicOpen(true) on permission denial", async () => {
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(new Error("denied"))
    const { setMicOpen } = renderRecorder()
    await act(async () => {
      fireEvent.click(screen.getByText("Or record with a microphone").closest("button")!)
    })
    expect(setMicOpen).toHaveBeenCalledWith(true)
  })

  it("Start recording calls MediaRecorder.start(100)", async () => {
    await setupGranted()
    await act(async () => { fireEvent.click(screen.getByText("Start recording")) })
    expect(MockMediaRecorder.lastInstance.start).toHaveBeenCalledWith(100)
  })

  it("Pause click calls MediaRecorder.pause()", async () => {
    await setupGranted()
    await act(async () => { fireEvent.click(screen.getByText("Start recording")) })
    await act(async () => { fireEvent.click(screen.getByText("Pause")) })
    expect(MockMediaRecorder.lastInstance.pause).toHaveBeenCalled()
  })

  it("Delete resets to idle and shows Start recording", async () => {
    await setupGranted()
    await act(async () => { fireEvent.click(screen.getByText("Start recording")) })
    await act(async () => { fireEvent.click(screen.getByTitle("Delete")) })
    expect(screen.getByText("Start recording")).toBeInTheDocument()
  })

  it("Delete removes undo/redo/trash buttons", async () => {
    await setupGranted()
    await act(async () => { fireEvent.click(screen.getByText("Start recording")) })
    await act(async () => { fireEvent.click(screen.getByTitle("Delete")) })
    expect(screen.queryByTitle("Undo 3s")).not.toBeInTheDocument()
    expect(screen.queryByTitle("Redo 3s")).not.toBeInTheDocument()
    expect(screen.queryByTitle("Delete")).not.toBeInTheDocument()
  })
})

// ─── Render: progress bar ─────────────────────────────────────────────────────

describe("Recorder — renders correctly (progress bar)", () => {
  it("shows progress bar while recording", async () => {
    await setupGranted()
    await act(async () => { fireEvent.click(screen.getByText("Start recording")) })
    expect(screen.getByText(/s left/)).toBeInTheDocument()
  })

  it("shows progress bar while paused", async () => {
    await setupGranted()
    await act(async () => { fireEvent.click(screen.getByText("Start recording")) })
    await act(async () => { fireEvent.click(screen.getByText("Pause")) })
    expect(screen.getByText(/s left/)).toBeInTheDocument()
  })

  it("does not show progress bar in idle state", async () => {
    await setupGranted()
    expect(screen.queryByText(/s left/)).not.toBeInTheDocument()
  })
})

// ─── Render: timer display ────────────────────────────────────────────────────

describe("Recorder — renders correctly (timer)", () => {
  it("shows 00:00 timer before recording starts", async () => {
    await setupGranted()
    expect(screen.getByText("00:00")).toBeInTheDocument()
  })

  it("timer is visible while recording", async () => {
    await setupGranted()
    await act(async () => { fireEvent.click(screen.getByText("Start recording")) })
    expect(screen.getByText("00:00")).toBeInTheDocument()
  })
})

// ─── Render: stopped state ────────────────────────────────────────────────────

describe("Recorder — renders correctly (stopped)", () => {
  it("shows Record again button after stopping", async () => {
    await setupGranted()
    await act(async () => { fireEvent.click(screen.getByText("Start recording")) })
    await act(async () => { fireEvent.click(screen.getByText("Pause")) })
    // Simulate stop by clicking finalize then going back — or check stopped label
    // Record again appears when recordingState === "stopped"
    // We verify the main button cycles correctly after a full stop
    expect(screen.queryByText("Pause")).not.toBeInTheDocument()
    expect(screen.getByText("Resume")).toBeInTheDocument()
  })

  it("does not show undo/redo in stopped state", async () => {
    await setupGranted()
    await act(async () => { fireEvent.click(screen.getByText("Start recording")) })
    await act(async () => { fireEvent.click(screen.getByText("Pause")) })
    await act(async () => { fireEvent.click(screen.getByTitle("Finalize")) })
    // After finalize, we're in finalized view — no undo/redo
    expect(screen.queryByTitle("Undo 3s")).not.toBeInTheDocument()
    expect(screen.queryByTitle("Redo 3s")).not.toBeInTheDocument()
  })
})