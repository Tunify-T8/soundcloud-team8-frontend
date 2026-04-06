import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DiscoverPage from "../../pages/DiscoverPage";

vi.mock("@/components/layout/Sidebar", () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

describe("DiscoverPage", () => {
  it("renders all discover section titles", () => {
    render(<DiscoverPage />);

    expect(screen.getByRole("heading", { name: "More of what you like" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recently Played" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Albums for you" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Made for you" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Artists to watch out for" })).toBeInTheDocument();
  });

  it("renders sidebar", () => {
    render(<DiscoverPage />);

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("renders discover tracks from mock response", () => {
    render(<DiscoverPage />);

    expect(screen.getAllByText("Rock Revolution").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Midnight Current").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Desert Neon").length).toBeGreaterThan(0);
  });
});
