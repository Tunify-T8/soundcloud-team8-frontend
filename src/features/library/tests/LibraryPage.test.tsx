import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import LibraryPage from "../pages/LibraryPage";

vi.mock("../tabs/OverviewTab", () => ({
  default: () => <div data-testid="tab-overview">Overview Content</div>,
}));
vi.mock("../tabs/LikesTab", () => ({
  default: () => <div data-testid="tab-likes">Likes Content</div>,
}));
vi.mock("../tabs/playlists/pages/PlaylistsTab", () => ({
  default: () => <div data-testid="tab-playlists">Playlists Content</div>,
}));
vi.mock("../tabs/AlbumsTab", () => ({
  default: () => <div data-testid="tab-albums">Albums Content</div>,
}));
vi.mock("../tabs/StationsTab", () => ({
  default: () => <div data-testid="tab-stations">Stations Content</div>,
}));
vi.mock("../tabs/FollowingTab", () => ({
  default: () => <div data-testid="tab-following">Following Content</div>,
}));
vi.mock("../tabs/HistoryTab", () => ({
  default: () => <div data-testid="tab-history">History Content</div>,
}));
vi.mock("../tabs/DownloadsTab", () => ({
  default: () => <div data-testid="tab-downloads">Downloads Content</div>,
}));
vi.mock("@/features/profile/context/useMe", () => ({
  useMe: () => ({ me: null }),
}));

function renderLibraryPage(route = "/library") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/library/albums" element={<LibraryPage />} />
        <Route path="/me/likes" element={<LibraryPage />} />
        <Route path="/me/sets" element={<LibraryPage />} />
        <Route path="/me/stations" element={<LibraryPage />} />
        <Route path="/me/following" element={<LibraryPage />} />
        <Route path="/me/history" element={<LibraryPage />} />
        <Route path="/me/downloads" element={<LibraryPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("LibraryPage", () => {
  it("renders all current library tabs", () => {
    renderLibraryPage();

    [
      "Overview",
      "Likes",
      "Playlists",
      "Albums",
      "Stations",
      "Following",
      "History",
      "Downloads",
    ].forEach((tab) => {
      expect(screen.getByRole("button", { name: tab })).toBeInTheDocument();
    });
  });

  it("shows overview content by default", () => {
    renderLibraryPage();

    expect(screen.getByText("Overview Content")).toBeInTheDocument();
    expect(screen.getByTestId("library-tab-overview-indicator")).toBeInTheDocument();
  });

  it("respects the current route when choosing the active tab", () => {
    renderLibraryPage("/me/downloads");

    expect(screen.getByText("Downloads Content")).toBeInTheDocument();
    expect(screen.getByTestId("library-tab-downloads-indicator")).toBeInTheDocument();
    expect(screen.queryByText("Overview Content")).not.toBeInTheDocument();
  });

  it("navigates to another tab when clicked", () => {
    renderLibraryPage();

    fireEvent.click(screen.getByRole("button", { name: "Likes" }));
    expect(screen.getByText("Likes Content")).toBeInTheDocument();
    expect(screen.getByTestId("library-tab-likes-indicator")).toBeInTheDocument();
  });

  it("renders the footer links", () => {
    renderLibraryPage();

    [
      "Legal",
      "Privacy",
      "Cookie Policy",
      "Cookie Manager",
      "Imprint",
      "Artist Resources",
      "Newsroom",
      "Charts",
      "Transparency Reports",
    ].forEach((link) => {
      expect(screen.getByText(link)).toBeInTheDocument();
    });
  });
});
