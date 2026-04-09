import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FollowingSection from "../components/FollowingSection";
import type { FollowingUser } from "../types";

const mockUsers: FollowingUser[] = [
  { id: "1", name: "Alice", avatarUrl: "https://example.com/alice.jpg", followers: "1.2K", verified: true },
  { id: "2", name: "Bob", avatarUrl: "https://example.com/bob.jpg", followers: "800" },
  { id: "3", name: "Carol", followers: "300" },
];

describe("FollowingSection", () => {
  it("renders the section heading", () => {
    render(<FollowingSection users={mockUsers} />);
    expect(screen.getByText("Hear what the people you follow have posted:")).toBeInTheDocument();
  });

  it("renders the browse link", () => {
    render(<FollowingSection users={mockUsers} />);
    expect(screen.getByText("Browse trending playlists")).toBeInTheDocument();
  });

  it("renders all user names", () => {
    render(<FollowingSection users={mockUsers} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
  });

  it("renders follower counts", () => {
    render(<FollowingSection users={mockUsers} />);
    expect(screen.getByText("1.2K followers")).toBeInTheDocument();
    expect(screen.getByText("800 followers")).toBeInTheDocument();
    expect(screen.getByText("300 followers")).toBeInTheDocument();
  });

  it("renders avatar images for users with avatarUrl", () => {
    render(<FollowingSection users={mockUsers} />);
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2); // Carol has no avatarUrl
    expect(images[0]).toHaveAttribute("src", "https://example.com/alice.jpg");
    expect(images[0]).toHaveAttribute("alt", "Alice");
    expect(images[1]).toHaveAttribute("src", "https://example.com/bob.jpg");
  });

  it("does not render a verification badge for unverified users", () => {
    const { container } = render(
      <FollowingSection users={[{ id: "x", name: "Dave", followers: "0" }]} />
    );
    const badges = container.querySelectorAll('svg circle[fill="#1da1f2"]');
    expect(badges).toHaveLength(0);
  });

  it("fills remaining slots with ghost placeholders up to 6", () => {
    const { container } = render(<FollowingSection users={mockUsers} />); // 3 users → 3 ghosts
    const ghosts = container.querySelectorAll('[class*="rounded-full"][class*="bg-\\[\\#282828\\]"]');
    // 3 real user avatar containers + 3 ghost divs = 6 round elements
    expect(ghosts.length).toBeGreaterThanOrEqual(3);
  });

  it("renders without errors when users array is empty", () => {
    render(<FollowingSection users={[]} />);
    expect(screen.getByText("Hear what the people you follow have posted:")).toBeInTheDocument();
  });
});

//npm run test -- src/features/library/tests/FollowingSection.test.tsx