import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import EmptyCollectionGrid from "../components/EmptyCollectionGrid";

function renderGrid(count?: number) {
  return render(
    <MemoryRouter>
      <EmptyCollectionGrid title="Recent Albums" count={count} />
    </MemoryRouter>,
  );
}

describe("EmptyCollectionGrid", () => {
  it("renders the section title and browse link", () => {
    renderGrid();

    expect(screen.getByTestId("empty-grid-title")).toHaveTextContent("Recent Albums");
    expect(screen.getByTestId("browse-trending-link")).toHaveAttribute("href", "/discover");
  });

  it("renders six placeholders by default", () => {
    renderGrid();

    expect(screen.getAllByTestId(/empty-slot-/)).toHaveLength(6);
  });

  it("renders the requested placeholder count", () => {
    renderGrid(3);
    expect(screen.getAllByTestId(/empty-slot-/)).toHaveLength(3);
  });

  it("renders no placeholders when count is zero", () => {
    renderGrid(0);
    expect(screen.queryAllByTestId(/empty-slot-/)).toHaveLength(0);
  });
});
