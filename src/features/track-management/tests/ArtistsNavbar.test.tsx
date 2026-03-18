import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ArtistsNavbar from "../components/ArtistsNavbar";

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <ArtistsNavbar />
    </MemoryRouter>
  );

describe("ArtistsNavbar", () => {
  it("renders the Search button", () => {
    renderWithRouter();
    expect(screen.getByText(/search/i)).toBeInTheDocument();
  });

  it("renders the Upload button", () => {
    renderWithRouter();
    expect(screen.getByText(/upload/i)).toBeInTheDocument();
  });

  it("renders exactly two icon-only action buttons (Bell and Mail)", () => {
    const { container } = renderWithRouter();
    const iconButtons = container.querySelectorAll("button.p-1\\.5");
    expect(iconButtons).toHaveLength(2);
  });

  it("renders the avatar placeholder button", () => {
    const { container } = renderWithRouter();
    const avatar = container.querySelector("button.w-8.h-8.rounded-full");
    expect(avatar).toBeInTheDocument();
  });

  it("root element has the correct fixed height class", () => {
    const { container } = renderWithRouter();
    const navbar = container.firstChild as HTMLElement;
    expect(navbar.className).toContain("h-[52px]");
  });

  it("root element has a black background", () => {
    const { container } = renderWithRouter();
    const navbar = container.firstChild as HTMLElement;
    expect(navbar.className).toContain("bg-black");
  });

  it("root element is right-aligned (justify-end)", () => {
    const { container } = renderWithRouter();
    const navbar = container.firstChild as HTMLElement;
    expect(navbar.className).toContain("justify-end");
  });
});

//npm run test -- src/features/track-management/tests/ArtistsNavbar.test.tsx