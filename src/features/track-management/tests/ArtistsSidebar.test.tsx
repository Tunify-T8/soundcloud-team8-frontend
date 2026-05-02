import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ArtistsSidebar from "../components/ArtistsSidebar";

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <ArtistsSidebar />
    </MemoryRouter>
  );

describe("ArtistsSidebar", () => {
  it("renders the SoundCloud logo", () => {
    const { container } = renderWithRouter();
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders the current nav labels", () => {
    renderWithRouter();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Library")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
  });

  it("renders exactly three nav item buttons (excluding the more menu)", () => {
    renderWithRouter();
    const buttons = screen
      .getAllByRole("button")
      .filter((btn) =>
        ["Home", "Library", "Stats"].some((label) =>
          btn.textContent?.includes(label)
        )
      );
    expect(buttons).toHaveLength(3);
  });

  it("renders the more-menu button at the bottom", () => {
    const { container } = renderWithRouter();
    const moreBtn = container.querySelector(".mt-auto button");
    expect(moreBtn).toBeInTheDocument();
  });

  it("more-menu button contains three dot spans", () => {
    const { container } = renderWithRouter();
    const moreBtn = container.querySelector(".mt-auto button");
    const dots = moreBtn?.querySelectorAll("span.rounded-full");
    expect(dots).toHaveLength(3);
  });

  it("renders inside a nav element", () => {
    renderWithRouter();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("nav has the correct fixed width class", () => {
    renderWithRouter();
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("w-[90px]");
  });

  it("nav has a black background", () => {
    renderWithRouter();
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("bg-black");
  });
});

//npm run test -- src/features/track-management/tests/ArtistsSidebar.test.tsx
