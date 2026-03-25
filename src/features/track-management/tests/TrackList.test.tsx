import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TrackList from "../components/TrackList";
import { SampleTracks } from "./SampleTracks";

// Mock the trackService so no real API call is made
vi.mock("../trackService", () => ({
  trackService: {
    deleteTrack: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockOnDelete = vi.fn();

const defaultProps = {
  tracks: SampleTracks,
  onDelete: mockOnDelete,
};

// Helper: walks through the full delete flow for a given track index
async function deleteTrackAtIndex(index: number) {
  // Step 1: open the "more" dropdown for that track
  const menuButtons = screen.getAllByRole("button");
  fireEvent.click(menuButtons[index]);

  // Step 2: click "Delete track" in the dropdown
  const deleteTrackOption = screen.getByRole("button", { name: /delete track/i });
  fireEvent.click(deleteTrackOption);

  // Step 3: confirm in the modal
  const confirmButton = screen.getByRole("button", { name: /delete forever/i });
  fireEvent.click(confirmButton);

  // Wait for the async trackService.deleteTrack() to resolve
  await waitFor(() => expect(mockOnDelete).toHaveBeenCalled());
}

describe("TrackList", () => {
  beforeEach(() => {
    mockOnDelete.mockClear();
  });

  it("renders all track titles", () => {
    render(<TrackList {...defaultProps} />);
    expect(screen.getByText("Midnight Echoes")).toBeInTheDocument();
    expect(screen.getByText("Unreleased Horizon")).toBeInTheDocument();
  });

  it("renders all column headers", () => {
    render(<TrackList {...defaultProps} />);
    expect(screen.getByText("TRACKS")).toBeInTheDocument();
    expect(screen.getByText("DURATION")).toBeInTheDocument();
    expect(screen.getByText("DATE")).toBeInTheDocument();
    expect(screen.getByText("ENGAGEMENTS")).toBeInTheDocument();
    expect(screen.getByText("PLAYS")).toBeInTheDocument();
  });

  it("renders an empty list without crashing", () => {
    render(<TrackList tracks={[]} onDelete={mockOnDelete} />);
    expect(screen.getByText("TRACKS")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("header select-all checkbox is unchecked initially", () => {
    render(<TrackList {...defaultProps} />);
    const [selectAll] = screen.getAllByRole("checkbox");
    expect(selectAll).not.toBeChecked();
  });

  it("toggles header select-all checkbox on click", () => {
    render(<TrackList {...defaultProps} />);
    const [selectAll] = screen.getAllByRole("checkbox");
    fireEvent.click(selectAll);
    expect(selectAll).toBeChecked();
    fireEvent.click(selectAll);
    expect(selectAll).not.toBeChecked();
  });

  it("individual track checkboxes start unchecked", () => {
    render(<TrackList {...defaultProps} />);
    const [, ...trackCheckboxes] = screen.getAllByRole("checkbox");
    trackCheckboxes.forEach((cb) => expect(cb).not.toBeChecked());
  });

  it("selecting a track checks its checkbox", () => {
    render(<TrackList {...defaultProps} />);
    const [, first] = screen.getAllByRole("checkbox");
    fireEvent.click(first);
    expect(first).toBeChecked();
  });

  it("deselects a track when clicked again", () => {
    render(<TrackList {...defaultProps} />);
    const [, first] = screen.getAllByRole("checkbox");
    fireEvent.click(first);
    expect(first).toBeChecked();
    fireEvent.click(first);
    expect(first).not.toBeChecked();
  });

  it("selecting one track does not affect others", () => {
    render(<TrackList {...defaultProps} />);
    const [, first, second] = screen.getAllByRole("checkbox");
    fireEvent.click(first);
    expect(first).toBeChecked();
    expect(second).not.toBeChecked();
  });

  it("renders the correct total number of checkboxes (tracks + header)", () => {
    render(<TrackList {...defaultProps} />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(SampleTracks.length + 1);
  });

  // onDelete tests
  it("does not call onDelete on initial render", () => {
    render(<TrackList {...defaultProps} />);
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it("calls onDelete with the correct track id after confirming deletion", async () => {
    render(<TrackList {...defaultProps} />);
    await deleteTrackAtIndex(0);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(SampleTracks[0].id);
  });

  it("calls onDelete independently for each track", async () => {
    render(<TrackList {...defaultProps} />);
    await deleteTrackAtIndex(0);
    await deleteTrackAtIndex(1);
    expect(mockOnDelete).toHaveBeenCalledTimes(2);
    expect(mockOnDelete).toHaveBeenNthCalledWith(1, SampleTracks[0].id);
    expect(mockOnDelete).toHaveBeenNthCalledWith(2, SampleTracks[1].id);
  });

  it("shows the confirmation modal when Delete track is clicked", () => {
    render(<TrackList {...defaultProps} />);
    const menuButtons = screen.getAllByRole("button");
    fireEvent.click(menuButtons[0]);
    fireEvent.click(screen.getByRole("button", { name: /delete track/i }));
    expect(screen.getByText(/permanently delete this track/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete forever/i })).toBeInTheDocument();
  });

  it("dismisses the modal when Cancel is clicked", () => {
    render(<TrackList {...defaultProps} />);
    const menuButtons = screen.getAllByRole("button");
    fireEvent.click(menuButtons[0]);
    fireEvent.click(screen.getByRole("button", { name: /delete track/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByText(/permanently delete this track/i)).not.toBeInTheDocument();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });
});

//npm run test -- src/features/track-management/tests/TrackList.test.tsx