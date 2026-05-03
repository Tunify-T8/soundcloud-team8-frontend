import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TrackList from "../components/TrackList";
import { SampleTracks } from "./SampleTracks";

const trackCardMock = vi.fn();

vi.mock("../components/TrackCard", () => ({
  default: (props: Record<string, unknown>) => {
    trackCardMock(props);
    return (
      <div data-testid={`track-card-${String(props.track && (props.track as { id: string }).id)}`}>
        <span>{String((props.track as { title: string }).title)}</span>
        <button onClick={() => (props.onSelect as (id: string) => void)?.((props.track as { id: string }).id)}>
          Select track
        </button>
        <button onClick={() => (props.onEdit as (id: string) => void)?.((props.track as { id: string }).id)}>
          Edit track
        </button>
        <button onClick={() => (props.onDelete as (id: string) => void)?.((props.track as { id: string }).id)}>
          Delete track
        </button>
      </div>
    );
  },
}));

vi.mock("../components/EditTrackDrawer", () => ({
  default: ({ track, onSaved }: { track: { title: string }; onSaved: () => void }) => (
    <div data-testid="edit-track-drawer">
      <span>{track.title}</span>
      <button onClick={onSaved}>Save edit</button>
    </div>
  ),
}));

vi.mock("@/features/library/tabs/playlists/components/CreatePlaylistOverlay", () => ({
  default: () => <div data-testid="bulk-playlist-overlay" />,
}));

describe("TrackList", () => {
  it("renders track headers and rows", () => {
    render(<TrackList tracks={SampleTracks} onDelete={vi.fn()} onUpdate={vi.fn()} />);

    expect(screen.getByText("TRACKS")).toBeInTheDocument();
    expect(screen.getByText("Midnight Echoes")).toBeInTheDocument();
    expect(screen.getByText("Unreleased Horizon")).toBeInTheDocument();
  });

  it("shows the selection toolbar after selecting a track", async () => {
    render(<TrackList tracks={SampleTracks} onDelete={vi.fn()} onUpdate={vi.fn()} />);

    await userEvent.click(screen.getAllByRole("button", { name: /select track/i })[0]);

    expect(screen.getByTestId("track-list-selection-bar")).toHaveTextContent("1 SELECTED");
  });

  it("opens the edit drawer when a track edit is requested", async () => {
    render(<TrackList tracks={SampleTracks} onDelete={vi.fn()} onUpdate={vi.fn()} />);

    await userEvent.click(screen.getAllByRole("button", { name: /edit track/i })[0]);

    expect(screen.getByTestId("edit-track-drawer")).toBeInTheDocument();
  });

  it("forwards deletion to the parent handler", async () => {
    const onDelete = vi.fn();
    render(<TrackList tracks={SampleTracks} onDelete={onDelete} onUpdate={vi.fn()} />);

    await userEvent.click(screen.getAllByRole("button", { name: /delete track/i })[0]);

    expect(onDelete).toHaveBeenCalledWith(SampleTracks[0].id);
  });
});
