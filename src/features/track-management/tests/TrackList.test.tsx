import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TrackList from "../components/TrackList";
import { SampleTracks } from "./SampleTracks";

//I used the same SampleTracks from mock data in unit tests as well
describe("TrackList", () => {
  it("renders all track titles", () => {
    render(<TrackList tracks={SampleTracks} />);
    expect(screen.getByText("Midnight Echoes")).toBeInTheDocument();
    expect(screen.getByText("Unreleased Horizon")).toBeInTheDocument();
  });

  it("renders all column headers", () => {
    render(<TrackList tracks={SampleTracks} />);
    expect(screen.getByText("TRACKS")).toBeInTheDocument();
    expect(screen.getByText("DURATION")).toBeInTheDocument();
    expect(screen.getByText("DATE")).toBeInTheDocument();
    expect(screen.getByText("ENGAGEMENTS")).toBeInTheDocument();
    expect(screen.getByText("PLAYS")).toBeInTheDocument();
  });

  it("renders an empty list without crashing", () => {
    render(<TrackList tracks={[]} />);
    expect(screen.getByText("TRACKS")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("header select-all checkbox is unchecked initially", () => {
    render(<TrackList tracks={SampleTracks} />);
    const [selectAll] = screen.getAllByRole("checkbox");
    expect(selectAll).not.toBeChecked();
  });

  it("toggles header select-all checkbox on click", () => {
    render(<TrackList tracks={SampleTracks} />);
    const [selectAll] = screen.getAllByRole("checkbox");
    fireEvent.click(selectAll);
    expect(selectAll).toBeChecked();
    fireEvent.click(selectAll);
    expect(selectAll).not.toBeChecked();
  });

  it("individual track checkboxes start unchecked", () => {
    render(<TrackList tracks={SampleTracks} />);
    const [, ...trackCheckboxes] = screen.getAllByRole("checkbox");
    trackCheckboxes.forEach((cb) => expect(cb).not.toBeChecked());
  });

  it("selecting a track checks its checkbox", () => {
    render(<TrackList tracks={SampleTracks} />);
    const [, first] = screen.getAllByRole("checkbox");
    fireEvent.click(first);
    expect(first).toBeChecked();
  });

  it("deselects a track when clicked again", () => {
    render(<TrackList tracks={SampleTracks} />);
    const [, first] = screen.getAllByRole("checkbox");
    fireEvent.click(first);
    expect(first).toBeChecked();
    fireEvent.click(first);
    expect(first).not.toBeChecked();
  });

  it("selecting one track does not affect others", () => {
    render(<TrackList tracks={SampleTracks} />);
    const [, first, second] = screen.getAllByRole("checkbox");
    fireEvent.click(first);
    expect(first).toBeChecked();
    expect(second).not.toBeChecked();
  });

  it("renders the correct total number of checkboxes (tracks + header)", () => {
    render(<TrackList tracks={SampleTracks} />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(SampleTracks.length + 1);
  });
});

//npm run test -- src/features/track-management/tests/TrackList.test.tsx