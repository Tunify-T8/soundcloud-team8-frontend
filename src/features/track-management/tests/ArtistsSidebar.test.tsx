import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ArtistsSidebar from "../components/ArtistsSidebar";

describe("ArtistsSidebar", () => {
  it("renders the SoundCloud logo", () => {
    const { container } = render(<ArtistsSidebar />);
    // SiSoundcloud renders an svg
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders all four nav labels", () => {
    render(<ArtistsSidebar />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Library")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
    expect(screen.getByText("Featured")).toBeInTheDocument();
  });

  it("renders exactly four nav item buttons (excluding the more menu)", () => {
    render(<ArtistsSidebar />);
    const buttons = screen
      .getAllByRole("button")
      .filter((btn) => ["Home", "Library", "Stats", "Featured"].some((label) =>
        btn.textContent?.includes(label)
      ));
    expect(buttons).toHaveLength(4);
  });

  it("renders the more-menu button at the bottom", () => {
    const { container } = render(<ArtistsSidebar />);
    const moreBtn = container.querySelector(".mt-auto button");
    expect(moreBtn).toBeInTheDocument();
  });

  it("more-menu button contains three dot spans", () => {
    const { container } = render(<ArtistsSidebar />);
    const moreBtn = container.querySelector(".mt-auto button");
    const dots = moreBtn?.querySelectorAll("span.rounded-full");
    expect(dots).toHaveLength(3);
  });

  it("renders inside a nav element", () => {
    render(<ArtistsSidebar />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("nav has the correct fixed width class", () => {
    render(<ArtistsSidebar />);
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("w-[90px]");
  });

  it("nav has a black background", () => {
    render(<ArtistsSidebar />);
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("bg-black");
  });
});

//npm run test -- src/features/track-management/tests/ArtistsSidebar.test.tsx