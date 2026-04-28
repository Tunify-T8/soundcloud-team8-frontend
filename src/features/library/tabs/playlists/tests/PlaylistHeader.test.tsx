import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import PlaylistHeader from "../components/PlaylistHeader";
import type { Collection, CollectionTrack } from "../../../types";

function makePlaylist(overrides: Partial<Collection> = {}): Collection {
  return {
    id: "pl-1",
    title: "Evening Set",
    description: null,
    type: "PLAYLIST",
    privacy: "public",
    coverUrl: null,
    trackCount: 2,
    likeCount: 0,
    repostsCount: 0,
    isLiked: false,
    owner: {
      id: "u-1",
      username: "alice",
      displayName: "Alice",
      avatarUrl: null,
      followerCount: 5,
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeTrack(id: string, title: string, durationSeconds: number): CollectionTrack {
  return {
    position: 1,
    addedAt: new Date().toISOString(),
    track: {
      id,
      title,
      durationSeconds,
      coverUrl: null,
      genreId: null,
      isPublic: true,
      user: {
        id: "u-1",
        username: "alice",
        displayName: "Alice",
        avatarUrl: null,
        followerCount: 0,
      },
    },
  };
}

describe("PlaylistHeader", () => {
  it("renders playlist title and owner display name", () => {
    render(<PlaylistHeader playlist={makePlaylist()} tracks={[]} />);
    expect(screen.getByText("Evening Set")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders username when displayName is missing", () => {
    render(
      <PlaylistHeader
        playlist={makePlaylist({
          owner: {
            id: "u-2",
            username: "bob",
            displayName: null,
            avatarUrl: null,
            followerCount: 0,
          },
        })}
      />,
    );
    expect(screen.getByText("bob")).toBeInTheDocument();
  });

  it("shows total duration from tracks", () => {
    const tracks = [makeTrack("t1", "A", 90), makeTrack("t2", "B", 30)];
    render(<PlaylistHeader playlist={makePlaylist()} tracks={tracks} />);
    expect(screen.getByText("2:00")).toBeInTheDocument();
  });

  it("shows upload image button only for owner view", () => {
    const { rerender } = render(
      <PlaylistHeader playlist={makePlaylist()} isMe tracks={[]} />,
    );
    expect(screen.getByRole("button", { name: /upload image/i })).toBeInTheDocument();

    rerender(<PlaylistHeader playlist={makePlaylist()} isMe={false} tracks={[]} />);
    expect(screen.queryByRole("button", { name: /upload image/i })).not.toBeInTheDocument();
  });
});
