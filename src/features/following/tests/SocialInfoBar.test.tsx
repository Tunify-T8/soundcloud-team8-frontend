import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SocialInfoBar from "../components/SocialInfoBar";

describe("SocialInfoBar", () => {
  it("renders the avatar, title, and navigation links", () => {
    render(
      <MemoryRouter initialEntries={["/alice/followers"]}>
        <SocialInfoBar
          avatarUrl="https://cdn.example.com/alice.jpg"
          title="Followers of Alice"
          basePath="/alice"
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("social-info-bar")).toBeInTheDocument();
    expect(screen.getByTestId("avatar-image")).toHaveAttribute("src", "https://cdn.example.com/alice.jpg");
    expect(screen.getByTestId("social-info-title")).toHaveTextContent("Followers of Alice");
    expect(screen.getByTestId("nav-likes")).toHaveAttribute("href", "/alice");
    expect(screen.getByTestId("nav-following")).toHaveAttribute("href", "/alice/following");
    expect(screen.getByTestId("nav-followers")).toHaveAttribute("href", "/alice/followers");
  });

  it("renders without an avatar image when none is provided", () => {
    render(
      <MemoryRouter>
        <SocialInfoBar title="Followers" basePath="/alice" />
      </MemoryRouter>,
    );

    expect(screen.queryByTestId("avatar-image")).not.toBeInTheDocument();
  });
});