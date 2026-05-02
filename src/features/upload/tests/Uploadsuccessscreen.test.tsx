import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import UploadSuccessScreen from "../components/UploadSuccessScreen";

vi.mock("@/features/premium/components/ArtistProUpgradeButton", () => ({
  default: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

function renderScreen(trackId = "track-1") {
  return render(
    <MemoryRouter>
      <UploadSuccessScreen trackId={trackId} />
    </MemoryRouter>,
  );
}

describe("UploadSuccessScreen", () => {
  it("renders the current success content", () => {
    renderScreen();

    expect(screen.getByTestId("success-heading")).toHaveTextContent("Saved to SoundCloud.");
    expect(screen.getByText(/your tracks are now on soundcloud/i)).toBeInTheDocument();
    expect(screen.getByTestId("distribute-heading")).toHaveTextContent(
      "Distribute to more streaming services?",
    );
  });

  it("links to discover from the header and to the uploaded track", () => {
    renderScreen("track-42");

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/discover");
    expect(screen.getByTestId("view-track-btn")).toHaveAttribute("href", "/tracks/track-42");
  });

  it("renders the Artist Pro CTA and footer links", () => {
    renderScreen();

    expect(screen.getByTestId("unlock-artist-pro-btn")).toBeInTheDocument();
    ["Legal", "Privacy", "Cookie Policy", "Cookie Manager", "Imprint"].forEach((link) => {
      expect(screen.getByText(link)).toBeInTheDocument();
    });
  });

  it("keeps the main actions clickable", () => {
    renderScreen();

    expect(() => fireEvent.click(screen.getByTestId("success-close-btn"))).not.toThrow();
    expect(() => fireEvent.click(screen.getByTestId("unlock-artist-pro-btn"))).not.toThrow();
  });
});
