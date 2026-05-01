import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import UploadSuccessScreen from "../components/UploadSuccessScreen"

// No Redux or mocks needed — purely presentational component

// ─── Render: header ───────────────────────────────────────────────────────────

describe("UploadSuccessScreen — renders correctly (header)", () => {
  it("renders the SoundCloud logo link to /", () => {
    render(<UploadSuccessScreen trackId="track-1" />)
    expect(screen.getAllByRole("link")[0]).toHaveAttribute("href", "/")
  })

  it("renders a close button", () => {
    render(<UploadSuccessScreen trackId="track-1" />)
    expect(screen.getAllByRole("button")[0]).toBeInTheDocument()
  })
})

// ─── Render: main content ─────────────────────────────────────────────────────

describe("UploadSuccessScreen — renders correctly (main content)", () => {
  it("renders success heading", () => {
    render(<UploadSuccessScreen trackId="track-1" />)
    expect(screen.getByText("Saved to SoundCloud.")).toBeInTheDocument()
  })

  it("renders congratulations message", () => {
    render(<UploadSuccessScreen trackId="track-1" />)
    expect(screen.getByText(/Congratulations/)).toBeInTheDocument()
  })

  it("renders View track button", () => {
    render(<UploadSuccessScreen trackId="track-1" />)
    expect(screen.getByText("View track")).toBeInTheDocument()
  })

  it("renders distribution upsell heading", () => {
    render(<UploadSuccessScreen trackId="track-1" />)
    expect(screen.getByText("Distribute to more streaming services?")).toBeInTheDocument()
  })

  it("renders Artist Pro upsell button", () => {
    render(<UploadSuccessScreen />)
    expect(screen.getByText("Unlock with Artist Pro")).toBeInTheDocument()
  })

  it("renders Learn more link", () => {
    render(<UploadSuccessScreen />)
    expect(screen.getByText("Learn more.")).toBeInTheDocument()
  })

  it("renders 4 streaming platform icon containers", () => {
    const { container } = render(<UploadSuccessScreen trackId="track-1" />)
    const platformIcons = container.querySelectorAll(".rounded-full.border-dashed")
    expect(platformIcons.length).toBe(4)
  })
})

// ─── Render: footer ───────────────────────────────────────────────────────────

describe("UploadSuccessScreen — renders correctly (footer)", () => {
  it("renders all footer links", () => {
    render(<UploadSuccessScreen trackId="track-1" />)
    ;["Legal", "Privacy", "Cookie Policy", "Cookie Manager", "Imprint", "About us", "Copyright", "Feedback"]
      .forEach(link => expect(screen.getByText(link)).toBeInTheDocument())
  })
})

// ─── Interactions ─────────────────────────────────────────────────────────────

describe("UploadSuccessScreen — interactions", () => {
  it("View track button is clickable", () => {
    render(<UploadSuccessScreen trackId="track-1" />)
    expect(() => fireEvent.click(screen.getByText("View track"))).not.toThrow()
  })

  it("Unlock with Artist Pro button is clickable", () => {
    render(<UploadSuccessScreen trackId="track-1" />)
    expect(() => fireEvent.click(screen.getByText("Unlock with Artist Pro"))).not.toThrow()
  })

  it("close button is clickable", () => {
    render(<UploadSuccessScreen trackId="track-1" />)
    expect(() => fireEvent.click(screen.getAllByRole("button")[0])).not.toThrow()
  })
})

// ─── Interactions: footer ─────────────────────────────────────────────────────

describe("UploadSuccessScreen — interactions (footer)", () => {
  it("footer links are clickable without throwing", () => {
    render(<UploadSuccessScreen trackId="track-1" />)
    expect(() => fireEvent.click(screen.getByText("Privacy"))).not.toThrow()
  })

  it("Learn more link is clickable without throwing", () => {
    render(<UploadSuccessScreen trackId="track-1" />)
    expect(() => fireEvent.click(screen.getByText("Learn more."))).not.toThrow()
  })

  it("Cookie Policy footer link is present and clickable", () => {
    render(<UploadSuccessScreen />)
    const link = screen.getByText("Cookie Policy")
    expect(link).toBeInTheDocument()
    expect(() => fireEvent.click(link)).not.toThrow()
  })

  it("Cookie Manager footer link is present and clickable", () => {
    render(<UploadSuccessScreen />)
    const link = screen.getByText("Cookie Manager")
    expect(link).toBeInTheDocument()
    expect(() => fireEvent.click(link)).not.toThrow()
  })
})