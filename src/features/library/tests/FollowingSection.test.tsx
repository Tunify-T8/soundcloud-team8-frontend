import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import FollowingSection from "../components/FollowingSection";
import type { FollowingUser } from "../types";

const mockUsers: FollowingUser[] = [
  {
    id: "1",
    name: "Alice",
    avatarUrl: "https://example.com/alice.jpg",
    followers: "1.2K",
    verified: true,
  },
  { id: "2", name: "Bob", avatarUrl: "https://example.com/bob.jpg", followers: "800" },
  { id: "3", name: "Carol", followers: "300" },
];

describe("FollowingSection", () => {
  it("renders all current user cards", () => {
    render(<FollowingSection users={mockUsers} />);

    expect(screen.getByTestId("following-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("following-card-2")).toBeInTheDocument();
    expect(screen.getByTestId("following-card-3")).toBeInTheDocument();
  });

  it("renders names and follower counts", () => {
    render(<FollowingSection users={mockUsers} />);

    expect(screen.getByTestId("following-name-1")).toHaveTextContent("Alice");
    expect(screen.getByTestId("following-followers-1")).toHaveTextContent("1.2K followers");
    expect(screen.getByTestId("following-followers-2")).toHaveTextContent("800 followers");
  });

  it("renders avatar images when available", () => {
    render(<FollowingSection users={mockUsers} />);

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("src", "https://example.com/alice.jpg");
  });

  it("renders without errors when the list is empty", () => {
    render(<FollowingSection users={[]} />);
    expect(screen.getByTestId("following-section")).toBeInTheDocument();
  });
});
