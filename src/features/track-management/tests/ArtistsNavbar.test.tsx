import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";

import ArtistsNavbar from "../components/ArtistsNavbar";
import { renderWithProviders } from "@/test/renderWithProviders";

vi.mock("@/features/profile/context/useMe", () => ({
  useMe: () => ({
    me: {
      username: "nada",
      avatarUrl: null,
    },
  }),
}));

describe("ArtistsNavbar", () => {
  it("renders the current navigation actions", () => {
    renderWithProviders(<ArtistsNavbar />);

    expect(screen.getByTestId("navbar-search-btn")).toBeInTheDocument();
    expect(screen.getByTestId("navbar-upload-btn")).toBeInTheDocument();
    expect(screen.getByTestId("navbar-notifications-btn")).toBeInTheDocument();
    expect(screen.getByTestId("navbar-messages-btn")).toBeInTheDocument();
  });

  it("links search, upload, and avatar to the expected routes", () => {
    renderWithProviders(<ArtistsNavbar />);

    expect(screen.getByRole("link", { name: /search/i })).toHaveAttribute("href", "/search");
    expect(screen.getByRole("link", { name: /upload/i })).toHaveAttribute("href", "/upload");
    expect(screen.getByRole("link", { name: /n/i })).toHaveAttribute("href", "/me");
  });

  it("shows the username initial when no avatar image exists", () => {
    renderWithProviders(<ArtistsNavbar />);

    expect(screen.getByTestId("navbar-avatar-initials")).toHaveTextContent("N");
  });
});
