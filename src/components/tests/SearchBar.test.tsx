import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SearchBar from "../ui/SearchBar";
import { renderWithProviders } from "@/test/renderWithProviders";

const mockNavigate = vi.fn();
const mockSearchAutocomplete = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

vi.mock("@/features/feed/feedservice", () => ({
  feedService: {
    searchAutocomplete: (...args: unknown[]) => mockSearchAutocomplete(...args),
  },
}));

describe("SearchBar", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSearchAutocomplete.mockReset();
    mockSearchAutocomplete.mockResolvedValue({
      tracks: [],
      users: [],
      collections: [],
    });
  });

  it("renders the search input", () => {
    renderWithProviders(<SearchBar />);
    expect(screen.getByTestId("search-input")).toHaveAttribute("placeholder", "Search");
  });

  it("navigates to the search page on Enter", async () => {
    renderWithProviders(<SearchBar />);

    await userEvent.type(screen.getByTestId("search-input"), "kendrick lamar{Enter}");

    expect(mockNavigate).toHaveBeenCalledWith("/search?q=kendrick%20lamar");
    expect(screen.getByTestId("search-input")).toHaveValue("");
  });

  it("navigates to /me when the query matches the current user", async () => {
    renderWithProviders(<SearchBar />, {
      preloadedState: {
        user: {
          currentUser: {
            id: "me-1",
            username: "nada",
            email: "nada@example.com",
            role: "listener",
            isVerified: true,
            avatarUrl: null,
          },
        },
      },
    });

    await userEvent.type(screen.getByTestId("search-input"), "Nada{Enter}");

    expect(mockNavigate).toHaveBeenCalledWith("/me");
  });

  it("shows autocomplete results and navigates when a result is selected", async () => {
    mockSearchAutocomplete.mockResolvedValue({
      tracks: [
        {
          id: "track-1",
          type: "track",
          title: "Skyline",
          artist: "Artist One",
          coverUrl: null,
        },
      ],
      users: [],
      collections: [],
    });

    renderWithProviders(<SearchBar />);

    await userEvent.type(screen.getByTestId("search-input"), "sky");

    await waitFor(() => {
      expect(screen.getByTestId("search-dropdown")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId("search-track-track-1"));

    expect(mockNavigate).toHaveBeenCalledWith("/tracks/track-1");
  });
});
