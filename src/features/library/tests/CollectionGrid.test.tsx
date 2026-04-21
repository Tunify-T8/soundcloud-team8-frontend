import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CollectionGrid from "../components/CollectionGrid";
import type { CollectionItem } from "../types";

const mockItems: CollectionItem[] = [
  { id: "1", title: "Chill Vibes", subtitle: "Playlist", coverUrl: "https://example.com/cover1.jpg" },
  { id: "2", title: "Top Hits", subtitle: "Album" },
  { id: "3", title: "Deep Focus", subtitle: "Mix", coverUrl: "https://example.com/cover3.jpg" },
];

describe("CollectionGrid", () => {
  it("renders the section title", () => {
    render(<CollectionGrid items={mockItems} title="My Playlists" />);
    expect(screen.getByText("My Playlists")).toBeInTheDocument();
  });

  it("renders all items", () => {
    render(<CollectionGrid items={mockItems} title="My Playlists" />);
    expect(screen.getByText("Chill Vibes")).toBeInTheDocument();
    expect(screen.getByText("Top Hits")).toBeInTheDocument();
    expect(screen.getByText("Deep Focus")).toBeInTheDocument();
  });

  it("renders item subtitles", () => {
    render(<CollectionGrid items={mockItems} title="My Playlists" />);
    expect(screen.getByText("Playlist")).toBeInTheDocument();
    expect(screen.getByText("Album")).toBeInTheDocument();
    expect(screen.getByText("Mix")).toBeInTheDocument();
  });

  it("does not show browse link by default", () => {
    render(<CollectionGrid items={mockItems} title="My Playlists" />);
    expect(screen.queryByText("Browse trending playlists")).not.toBeInTheDocument();
  });

  it("shows browse link when showBrowse is true", () => {
    render(<CollectionGrid items={mockItems} title="My Playlists" showBrowse />);
    expect(screen.getByText("Browse trending playlists")).toBeInTheDocument();
  });

  it("renders cover images for items with coverUrl", () => {
    render(<CollectionGrid items={mockItems} title="My Playlists" />);
    const images = screen.getAllByRole("img");
    // Only items with a non-empty coverUrl get an <img>
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("src", "https://example.com/cover1.jpg");
    expect(images[0]).toHaveAttribute("alt", "Chill Vibes");
  });

  it("renders a placeholder div when coverUrl is absent", () => {
    render(<CollectionGrid items={[{ id: "x", title: "No Cover", subtitle: "Sub" }]} title="Test" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders an empty list without errors", () => {
    render(<CollectionGrid items={[]} title="Empty" />);
    expect(screen.getByText("Empty")).toBeInTheDocument();
  });
});

//npm run test -- src/features/library/tests/CollectionGrid.test.tsx
