import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LibraryPage from "../pages/LibraryPage";

// ── Mock all tab components ──────────────────────────────────────────────────
vi.mock("../tabs/OverviewTab",   () => ({ default: () => <div data-testid="tab-overview">Overview Content</div> }));
vi.mock("../tabs/LikesTab",      () => ({ default: () => <div data-testid="tab-likes">Likes Content</div> }));
vi.mock("../tabs/playlists/PlaylistsTab",  () => ({ default: () => <div data-testid="tab-playlists">Playlists Content</div> }));
vi.mock("../tabs/AlbumsTab",     () => ({ default: () => <div data-testid="tab-albums">Albums Content</div> }));
vi.mock("../tabs/StationsTab",   () => ({ default: () => <div data-testid="tab-stations">Stations Content</div> }));
vi.mock("../tabs/FollowingTab",  () => ({ default: () => <div data-testid="tab-following">Following Content</div> }));
vi.mock("../tabs/HistoryTab",    () => ({ default: () => <div data-testid="tab-history">History Content</div> }));

// ── Helpers ──────────────────────────────────────────────────────────────────
const ALL_TABS = ["Overview", "Likes", "Playlists", "Albums", "Stations", "Following", "History"] as const;
type Tab = typeof ALL_TABS[number];

const TAB_TEST_IDS: Record<Tab, string> = {
  Overview:  "tab-overview",
  Likes:     "tab-likes",
  Playlists: "tab-playlists",
  Albums:    "tab-albums",
  Stations:  "tab-stations",
  Following: "tab-following",
  History:   "tab-history",
};

function getTabButton(name: Tab) {
  return screen.getByRole("button", { name });
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe("LibraryPage", () => {
  beforeEach(() => {
    render(<LibraryPage />);
  });

  // -- Rendering --------------------------------------------------------------
  describe("initial render", () => {
    it("renders all 7 tab buttons", () => {
      ALL_TABS.forEach((tab) => {
        expect(screen.getByRole("button", { name: tab })).toBeInTheDocument();
      });
    });

    it("shows the Overview tab content by default", () => {
      expect(screen.getByTestId("tab-overview")).toBeInTheDocument();
    });

    it("does not render any other tab content on mount", () => {
      const otherTabs = ALL_TABS.filter((t) => t !== "Overview");
      otherTabs.forEach((tab) => {
        expect(screen.queryByTestId(TAB_TEST_IDS[tab])).not.toBeInTheDocument();
      });
    });
  });

  // -- Active tab indicator ---------------------------------------------------
  describe("active tab indicator", () => {
   
    it("applies muted color to inactive tabs", () => {
      ALL_TABS.filter((t) => t !== "Overview").forEach((tab) => {
        expect(getTabButton(tab)).toHaveStyle({ color: "#71717a" });
      });
    });

    it("renders the active underline indicator only for the active tab", () => {
      const activeBtn = getTabButton("Overview");
      const underline = activeBtn.querySelector(".h-\\[2px\\]");
      expect(underline).toBeInTheDocument();
    });

    it("inactive tabs do not render the underline indicator", () => {
      ALL_TABS.filter((t) => t !== "Overview").forEach((tab) => {
        const btn = getTabButton(tab);
        const underline = btn.querySelector(".h-\\[2px\\]");
        expect(underline).not.toBeInTheDocument();
      });
    });
  });

  // -- Tab switching ----------------------------------------------------------
  describe("tab switching", () => {
    it.each(ALL_TABS.filter((t) => t !== "Overview"))(
      "clicking '%s' shows its content and hides Overview",
      (tab) => {
        fireEvent.click(getTabButton(tab));
        expect(screen.getByTestId(TAB_TEST_IDS[tab])).toBeInTheDocument();
        expect(screen.queryByTestId("tab-overview")).not.toBeInTheDocument();
      }
    );

    it("only renders one tab's content at a time", () => {
      fireEvent.click(getTabButton("Likes"));

      const visibleTabs = ALL_TABS.filter(
        (tab) => screen.queryByTestId(TAB_TEST_IDS[tab]) !== null
      );
      expect(visibleTabs).toHaveLength(1);
      expect(visibleTabs[0]).toBe("Likes");
    });

    it("clicking the already-active tab keeps its content visible", () => {
      fireEvent.click(getTabButton("Overview")); // re-click default
      expect(screen.getByTestId("tab-overview")).toBeInTheDocument();
    });

    it("can switch tabs multiple times in sequence", () => {
      const sequence: Tab[] = ["Playlists", "Albums", "Following", "Overview"];
      sequence.forEach((tab) => {
        fireEvent.click(getTabButton(tab));
        expect(screen.getByTestId(TAB_TEST_IDS[tab])).toBeInTheDocument();
      });
    });
  });

  // -- Layout & accessibility -------------------------------------------------
  describe("layout and accessibility", () => {
    it("renders tab buttons inside a sticky nav container", () => {
      const sticky = document.querySelector(".sticky");
      expect(sticky).toBeInTheDocument();
      ALL_TABS.forEach((tab) => {
        expect(sticky).toContainElement(getTabButton(tab));
      });
    });

    it("renders the content area below the tab bar", () => {
      const content = screen.getByTestId("tab-overview").closest(".pl-40");
      expect(content).toBeInTheDocument();
    });

    it("all tab buttons are keyboard-focusable (no tabIndex=-1)", () => {
      ALL_TABS.forEach((tab) => {
        expect(getTabButton(tab)).not.toHaveAttribute("tabindex", "-1");
      });
    });

    it("tab buttons all share consistent font size of 18px", () => {
      ALL_TABS.forEach((tab) => {
        expect(getTabButton(tab)).toHaveStyle({ fontSize: "18px" });
      });
    });
  });
});

//npm run test -- src/features/library/tests/LibraryPage.test.tsx
