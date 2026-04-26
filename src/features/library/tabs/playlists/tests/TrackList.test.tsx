import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TrackList from "../components/TrackList";
import type { CollectionTrack } from "../../../types";

function makeTrack(
  overrides: Partial<CollectionTrack> = {},
  extraTrackFields: Record<string, unknown> = {},
): CollectionTrack {
  const base: CollectionTrack = {
    position: 1,
    addedAt: "2026-01-01T00:00:00.000Z",
    track: {
      id: "track-1",
      title: "Night Drive",
      durationSeconds: 180,
      coverUrl: "https://img.test/cover.jpg",
      genreId: null,
      isPublic: true,
      user: {
        id: "user-1",
        username: "alice",
        displayName: "Alice",
        avatarUrl: null,
        followerCount: 0,
      },
    },
  };

  return {
    ...base,
    ...overrides,
    track: {
      ...base.track,
      ...(overrides.track ?? {}),
      ...(extraTrackFields as Partial<typeof base.track>),
      user: {
        ...base.track.user,
        ...(overrides.track?.user ?? {}),
      },
    },
  };
}

describe("Playlist TrackList", () => {
  it("renders artist and title with list index", () => {
    const tracks: CollectionTrack[] = [
      makeTrack({
        track: {
          id: "track-1",
          title: "Glow",
          user: {
            id: "u-1",
            username: "alice",
            displayName: "Alice",
            avatarUrl: null,
            followerCount: 0,
          },
        },
      }),
      makeTrack({
        track: {
          id: "track-2",
          title: "Echoes",
          user: {
            id: "u-2",
            username: "bob",
            displayName: null,
            avatarUrl: null,
            followerCount: 0,
          },
        },
      }),
    ];

    render(<TrackList tracks={tracks} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Glow")).toBeInTheDocument();
    expect(screen.getByText("bob")).toBeInTheDocument();
    expect(screen.getByText("Echoes")).toBeInTheDocument();
  });

  it("uses default cover image when coverUrl is missing", () => {
    const tracks: CollectionTrack[] = [
      makeTrack({
        track: { id: "track-3", title: "No Cover", coverUrl: null },
      }),
    ];

    render(<TrackList tracks={tracks} />);

    const img = screen.getByRole("img", { name: "No Cover" });
    expect(img).toHaveAttribute("src", "/default-cover.png");
  });

  it("shows compact play counts from playCount and playsCount", () => {
    const tracks: CollectionTrack[] = [
      makeTrack(
        { track: { id: "track-4", title: "With playCount" } },
        { playCount: 1500 },
      ),
      makeTrack(
        { track: { id: "track-5", title: "With playsCount" } },
        { playsCount: 2300 },
      ),
    ];

    render(<TrackList tracks={tracks} />);

    expect(screen.getByText(/1\.5k/i)).toBeInTheDocument();
    expect(screen.getByText(/2\.3k/i)).toBeInTheDocument();
  });
});
