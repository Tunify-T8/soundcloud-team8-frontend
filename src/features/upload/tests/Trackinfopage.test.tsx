import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import TrackInfoPage from "../components/TrackInfo"
import audioSourceReducer from "../../../store/AudioSourceSlice"
import {
  mockAlbumBoxStyles,
  mockFileSource,
  mockRecordedSource,
} from "./mockData"

// ✅ FULL axios mock
vi.mock("axios", () => {
  const mockAxiosInstance = {
    get: vi.fn().mockResolvedValue({
      data: new Blob(["audio"], { type: "audio/mp3" }),
    }),
    post: vi.fn().mockResolvedValue({
      data: { id: "track-123" },
    }),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  }

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  }
})

// ─── Setup ────────────────────────────────────────────────────────────────────

function makeStore(source = mockFileSource) {
  const store = configureStore({
    reducer: { audioSource: audioSourceReducer },
  })
  store.dispatch({ type: "audioSource/setAudioSource", payload: source })
  return store
}

function renderPage(source = mockFileSource, onBack = vi.fn()) {
  const store = makeStore(source)
  return {
    ...render(
      <Provider store={store}>
        <TrackInfoPage onBack={onBack} />
      </Provider>
    ),
    store,
    onBack,
  }
}

beforeEach(() => {
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:mock"),
    revokeObjectURL: vi.fn(),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

// ─── Render: header ───────────────────────────────────────────────────────────

describe("TrackInfoPage — renders correctly (header)", () => {
  it("renders Track info heading", () => {
    renderPage()
    expect(screen.getByText("Track info")).toBeInTheDocument()
  })

  it("renders file name for file source", () => {
    renderPage()
    expect(screen.getByText("my-track.mp3")).toBeInTheDocument()
  })

  it("renders recording.wav for recorded source", () => {
    renderPage(mockRecordedSource)
    expect(screen.getByText("recording.wav")).toBeInTheDocument()
  })
})

// ─── Render: form fields ──────────────────────────────────────────────────────

describe("TrackInfoPage — renders correctly (form)", () => {
  it("renders title input pre-filled with filename (no extension)", () => {
    renderPage()
    expect(screen.getByDisplayValue("my-track")).toBeInTheDocument()
  })

  it("renders Genre input", () => {
    renderPage()
    expect(
      screen.getByPlaceholderText("Add or search for genre")
    ).toBeInTheDocument()
  })

  it("renders Tags input", () => {
    renderPage()
    expect(
      screen.getByPlaceholderText("Add styles, moods, tempo.")
    ).toBeInTheDocument()
  })

  it("renders Description textarea", () => {
    renderPage()
    expect(
      screen.getByPlaceholderText(/Tracks with descriptions/)
    ).toBeInTheDocument()
  })

  it("renders all three privacy radio options", () => {
    renderPage()
    expect(screen.getByLabelText("Public")).toBeInTheDocument()
    expect(screen.getByLabelText("Private")).toBeInTheDocument()
    expect(screen.getByLabelText("Schedule")).toBeInTheDocument()
  })

  it("Public is checked by default", () => {
    renderPage()
    expect(
      screen.getByLabelText<HTMLInputElement>("Public").checked
    ).toBe(true)
  })
})

// ─── Render: collapsible sections ─────────────────────────────────────────────

describe("TrackInfoPage — renders correctly (sections collapsed)", () => {
  it("Advanced details content is hidden by default", () => {
    renderPage()
    expect(screen.queryByText("Buy link")).not.toBeInTheDocument()
  })

  it("Permissions content is hidden by default", () => {
    renderPage()
    expect(
      screen.queryByText("Enable direct downloads")
    ).not.toBeInTheDocument()
  })

  it("Licensing content is hidden by default", () => {
    renderPage()
    expect(
      screen.queryByText("All rights reserved")
    ).not.toBeInTheDocument()
  })

  it("Audio clip content is hidden by default", () => {
    renderPage()
    expect(
      screen.queryByText(/Can't set audio preview/)
    ).not.toBeInTheDocument()
  })
})

// ─── Render: upload button (fixed) ────────────────────────────────────────────

describe("TrackInfoPage — renders correctly (upload button)", () => {
  it("renders the Upload button", () => {
    renderPage()
    expect(
      screen.getByRole("button", { name: /upload|uploading/i })
    ).toBeInTheDocument()
  })
})

// ─── Interactions: header ─────────────────────────────────────────────────────

describe("TrackInfoPage — interactions (header)", () => {
  it("close button calls onBack", () => {
    const onBack = vi.fn()
    renderPage(mockFileSource, onBack)
    const closeBtn = document
      .querySelector("button svg line[x1='18'][y1='6']")
      ?.closest("button") as HTMLElement
    fireEvent.click(closeBtn)
    expect(onBack).toHaveBeenCalled()
  })
})

// ─── Interactions: collapsible sections ──────────────────────────────────────

describe("TrackInfoPage — interactions (collapsible sections)", () => {
  it("clicking Advanced details reveals its content", () => {
    renderPage()
    fireEvent.click(screen.getByText("Advanced details"))
    expect(screen.getByText("Buy link")).toBeInTheDocument()
  })

  it("clicking Advanced details again hides its content", () => {
    renderPage()
    fireEvent.click(screen.getByText("Advanced details"))
    fireEvent.click(screen.getByText("Advanced details"))
    expect(screen.queryByText("Buy link")).not.toBeInTheDocument()
  })

  it("clicking Permissions reveals its content", () => {
    renderPage()
    fireEvent.click(screen.getByText("Permissions"))
    expect(
      screen.getByText("Enable direct downloads")
    ).toBeInTheDocument()
  })

  it("clicking Licensing reveals its content", () => {
    renderPage()
    fireEvent.click(screen.getByText("Licensing"))
    expect(screen.getByText("All rights reserved")).toBeInTheDocument()
  })

  it("clicking Audio clip reveals its content", () => {
    renderPage()
    fireEvent.click(screen.getByText("Audio clip"))
    expect(
      screen.getByText(/Can't set audio preview/)
    ).toBeInTheDocument()
  })
})

// ─── Interactions: toggles ────────────────────────────────────────────────────

describe("TrackInfoPage — interactions (toggles)", () => {
  it("clicking a toggle flips its enabled state", () => {
    renderPage()
    fireEvent.click(screen.getByText("Permissions"))
    const toggles =
      document.querySelectorAll<HTMLElement>(".rounded-full.cursor-pointer")
    const first = toggles[0]
    const wasEnabled = first.classList.contains("bg-[#169b45]")
    fireEvent.click(first)
    expect(first.classList.contains("bg-[#169b45]")).toBe(!wasEnabled)
  })
})

// ─── Interactions: privacy radio ──────────────────────────────────────────────

describe("TrackInfoPage — interactions (privacy)", () => {
  it("clicking Private selects it", () => {
    renderPage()
    fireEvent.click(screen.getByLabelText("Private"))
    expect(
      screen.getByLabelText<HTMLInputElement>("Private").checked
    ).toBe(true)
  })

  it("clicking Schedule selects it", () => {
    renderPage()
    fireEvent.click(screen.getByLabelText("Schedule"))
    expect(
      screen.getByLabelText<HTMLInputElement>("Schedule").checked
    ).toBe(true)
  })
})

// ─── Interactions: licensing ──────────────────────────────────────────────────

describe("TrackInfoPage — interactions (licensing)", () => {
  it("clicking Creative Commons selects it", () => {
    renderPage()
    fireEvent.click(screen.getByText("Licensing"))
    const radios = screen.getAllByRole("radio")
    fireEvent.click(radios[radios.length - 1])
    expect(radios[radios.length - 1]).toBeChecked()
  })
})

// ─── Interactions: form inputs ────────────────────────────────────────────────

describe("TrackInfoPage — interactions (form inputs)", () => {
  it("typing in genre input updates its value", () => {
    renderPage()
    const genre = screen.getByPlaceholderText(
      "Add or search for genre"
    ) as HTMLInputElement
    fireEvent.change(genre, { target: { value: "Hip-Hop" } })
    expect(genre.value).toBe("Hip-Hop")
  })

  it("typing in tags input updates its value", () => {
    renderPage()
    const tags = screen.getByPlaceholderText(
      "Add styles, moods, tempo."
    ) as HTMLInputElement
    fireEvent.change(tags, { target: { value: "chill, lo-fi" } })
    expect(tags.value).toBe("chill, lo-fi")
  })

  it("typing in description updates its value", () => {
    renderPage()
    const desc = screen.getByPlaceholderText(
      /Tracks with descriptions/
    ) as HTMLTextAreaElement
    fireEvent.change(desc, { target: { value: "My new track" } })
    expect(desc.value).toBe("My new track")
  })

  it("typing in title input updates its value", () => {
    renderPage()
    const title = screen.getByDisplayValue(
      "my-track"
    ) as HTMLInputElement
    fireEvent.change(title, { target: { value: "New Title" } })
    expect(title.value).toBe("New Title")
  })
})

// ─── Interactions: artwork ────────────────────────────────────────────────────

describe("TrackInfoPage — interactions (artwork)", () => {
  it("artwork picker area is present", () => {
    const { container } = renderPage()
    const picker = container.querySelector(
      "input[type='file'][accept='image/*']"
    )
    expect(picker).toBeInTheDocument()
  })

  it("artwork area shows Add new artwork text by default", () => {
    renderPage()
    expect(screen.getByText("Add new artwork")).toBeInTheDocument()
  })

  it("renders artwork inside the small album box dimensions", () => {
    const { container } = renderPage()
    const box = container.querySelector(
      `div[style*="left: ${mockAlbumBoxStyles.left}"][style*="top: ${mockAlbumBoxStyles.top}"][style*="width: ${mockAlbumBoxStyles.size}"][style*="height: ${mockAlbumBoxStyles.size}"]`
    )
    expect(box).toBeInTheDocument()
  })
})

// ─── Interactions: geoblocking ────────────────────────────────────────────────

describe("TrackInfoPage — interactions (geoblocking)", () => {
  it("geoblocking radio options are visible when Permissions is open", () => {
    renderPage()
    fireEvent.click(screen.getByText("Permissions"))
    expect(screen.getByLabelText("Worldwide")).toBeInTheDocument()
    expect(screen.getByLabelText("Exclusive regions")).toBeInTheDocument()
    expect(screen.getByLabelText("Blocked regions")).toBeInTheDocument()
  })
})
