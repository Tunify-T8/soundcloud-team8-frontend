import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import CollectionGrid from "../components/CollectionGrid";
import type { CollectionItem } from "../types";

const mediaCardMock = vi.fn();

vi.mock("../components/MediaCard", () => ({
  default: (props: Record<string, unknown>) => {
    mediaCardMock(props);
    return (
      <div data-testid={`media-card-${String(props.id)}`}>
        <span>{String(props.title)}</span>
        <span>{String(props.subtitle)}</span>
      </div>
    );
  },
}));

const mockItems: CollectionItem[] = [
  { id: "1", title: "Chill Vibes", subtitle: "Playlist", coverUrl: "https://example.com/cover1.jpg", entityType: "playlist" },
  { id: "2", title: "Top Hits", subtitle: "Album", entityType: "album" },
];

describe("CollectionGrid", () => {
  it("renders the section title and items", () => {
    render(
      <MemoryRouter>
        <CollectionGrid items={mockItems} title="My Playlists" />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("collection-grid-title")).toHaveTextContent("My Playlists");
    expect(screen.getByTestId("media-card-1")).toHaveTextContent("Chill Vibes");
    expect(screen.getByTestId("media-card-2")).toHaveTextContent("Top Hits");
  });

  it("renders the browse link when enabled", () => {
    render(
      <MemoryRouter>
        <CollectionGrid items={mockItems} title="My Playlists" showBrowse />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /browse trending playlists/i })).toHaveAttribute("href", "/home");
  });

  it("passes the expected link target to MediaCard", () => {
    mediaCardMock.mockClear();

    render(
      <MemoryRouter>
        <CollectionGrid items={mockItems} title="My Playlists" />
      </MemoryRouter>,
    );

    const firstCallProps = mediaCardMock.mock.calls[0]?.[0];
    const secondCallProps = mediaCardMock.mock.calls[1]?.[0];

    expect(firstCallProps).toMatchObject({
      id: "1",
      linkTo: "/collections/1",
      hoverVariant: "play",
    });
    expect(secondCallProps).toMatchObject({
      id: "2",
      linkTo: "/collections/2",
    });
  });
});
