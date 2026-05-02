import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UserCard from "../components/UserCard";

describe("UserCard", () => {
  it("renders avatar, counts, verified badge, and action slot", () => {
    render(
      <MemoryRouter>
        <UserCard
          id="user-1"
          username="alice"
          displayName="Alice Example"
          avatarUrl="https://cdn.example.com/alice.jpg"
          followersCount={1}
          verified
          action={<button type="button">Follow</button>}
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("user-card-user-1")).toBeInTheDocument();
    expect(screen.getByTestId("user-card-avatar-user-1")).toHaveAttribute("src", "https://cdn.example.com/alice.jpg");
    expect(screen.getByText("Alice Example")).toBeInTheDocument();
    expect(screen.getByText("1 follower")).toBeInTheDocument();
    expect(screen.getByTestId("user-card-verified-user-1")).toBeInTheDocument();
    expect(screen.getByTestId("user-card-action-user-1")).toHaveTextContent("Follow");
  });

  it("falls back to a placeholder avatar and username when needed", () => {
    render(
      <MemoryRouter>
        <UserCard id="user-2" username="nightwave" />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("user-card-avatar-placeholder-user-2")).toBeInTheDocument();
    expect(screen.getByText("nightwave")).toBeInTheDocument();
  });
});