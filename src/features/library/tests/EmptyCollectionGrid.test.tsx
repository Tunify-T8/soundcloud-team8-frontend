import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyCollectionGrid from "../components/EmptyCollectionGrid";

describe("EmptyCollectionGrid", () => {
  it("renders the section title", () => {
    render(<EmptyCollectionGrid title="Recent Albums" />);
    expect(screen.getByText("Recent Albums")).toBeInTheDocument();
  });

  it("always renders the browse link", () => {
    render(<EmptyCollectionGrid title="Recent Albums" />);
    expect(screen.getByText("Browse trending playlists")).toBeInTheDocument();
  });

  it("renders 6 placeholder blocks by default", () => {
    const { container } = render(<EmptyCollectionGrid title="Recent Albums" />);
    // Each placeholder is a div with the bg-[#282828] class inside the flex row
    const placeholders = container.querySelectorAll(".flex.gap-4 > div");
    expect(placeholders).toHaveLength(6);
  });

  it("renders the correct number of placeholders when count is provided", () => {
    const { container } = render(<EmptyCollectionGrid title="Recent Albums" count={3} />);
    const placeholders = container.querySelectorAll(".flex.gap-4 > div");
    expect(placeholders).toHaveLength(3);
  });

  it("renders 1 placeholder when count is 1", () => {
    const { container } = render(<EmptyCollectionGrid title="Recent Albums" count={1} />);
    const placeholders = container.querySelectorAll(".flex.gap-4 > div");
    expect(placeholders).toHaveLength(1);
  });

  it("renders 0 placeholders when count is 0", () => {
    const { container } = render(<EmptyCollectionGrid title="Recent Albums" count={0} />);
    const placeholders = container.querySelectorAll(".flex.gap-4 > div");
    expect(placeholders).toHaveLength(0);
  });

  it("renders placeholders with correct dimensions classes", () => {
    const { container } = render(<EmptyCollectionGrid title="Recent Albums" count={1} />);
    const placeholder = container.querySelector(".flex.gap-4 > div");
    expect(placeholder).toHaveClass("w-[170px]", "h-[170px]", "rounded-sm", "bg-[#282828]");
  });
});

//npm run test -- src/features/library/tests/EmptyCollectionGrid.test.tsx