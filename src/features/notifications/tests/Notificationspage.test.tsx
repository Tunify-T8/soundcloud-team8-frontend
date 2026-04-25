/**
 * NotificationsPage – UI rendering tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

import NotificationsPage from "../pages/NotificationPage";

// ─── Module mocks ────────────────────────────────────────────────────────────

vi.mock("socket.io-client", () => ({
  io: () => ({
    on: vi.fn(),
    disconnect: vi.fn(),
  }),
}));

vi.mock("@/features/auth/utils/token.utils", () => ({
  getAccessToken: () => "test-token",
}));

vi.mock("@/features/notifications/service/service", () => ({
  getNotifications: vi.fn(),
  markNotificationAsRead: vi.fn().mockResolvedValue(undefined),
  followUser: vi.fn().mockResolvedValue(undefined),
}));

import { getNotifications } from "@/features/notifications/service/service";

const mockGetNotifications = getNotifications as unknown as ReturnType<typeof vi.fn>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeNotification(overrides: any = {}) {
  return {
    id: overrides.id ?? "notif-1",
    type: overrides.type ?? "track_liked",
    actor: {
      id: overrides.actorId ?? "user-1",
      username: overrides.username ?? "alice",
      avatarUrl: overrides.avatarUrl ?? null,
    },
    referenceId: null,
    message: overrides.message ?? "liked your track",
    isRead: false,
    readAt: null,
    createdAt:
      overrides.createdAt ??
      new Date(Date.now() - 60_000).toISOString(),
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <NotificationsPage />
    </MemoryRouter>
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("NotificationsPage", () => {

  describe("loading state", () => {
    it("shows loading indicator", () => {
      mockGetNotifications.mockReturnValue(new Promise(() => {}));
      renderPage();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    beforeEach(() => {
      mockGetNotifications.mockResolvedValue({ data: [] });
    });

    it("shows empty message", async () => {
      renderPage();
      expect(await screen.findByText(/no notifications/i)).toBeInTheDocument();
    });
  });

  describe("notification rows", () => {
    it("renders username and message", async () => {
      mockGetNotifications.mockResolvedValue({
        data: [makeNotification({ username: "bob" })],
      });

      renderPage();

      expect(await screen.findByText("bob")).toBeInTheDocument();
      expect(screen.getByText(/liked your track/i)).toBeInTheDocument();
    });

    it("renders multiple notifications", async () => {
      mockGetNotifications.mockResolvedValue({
        data: [
          makeNotification({ id: "1", username: "alice" }),
          makeNotification({ id: "2", username: "bob" }),
        ],
      });

      renderPage();

      expect(await screen.findByText("alice")).toBeInTheDocument();
      expect(screen.getByText("bob")).toBeInTheDocument();
    });
  });

  describe("avatar rendering", () => {
    it("renders image avatar", async () => {
      mockGetNotifications.mockResolvedValue({
        data: [
          makeNotification({
            username: "alice",
            avatarUrl: "https://img.com/a.jpg",
          }),
        ],
      });

      renderPage();

      const img = await screen.findByRole("img", { name: "alice" });
      expect(img).toHaveAttribute("src", "https://img.com/a.jpg");
    });

    it("renders fallback initial", async () => {
      mockGetNotifications.mockResolvedValue({
        data: [makeNotification({ username: "zara", avatarUrl: null })],
      });

      renderPage();

      await screen.findByText("zara");
      expect(screen.getAllByText("Z").length).toBeGreaterThan(0);
    });
  });

  describe("follow notifications", () => {
    it("shows follow back button", async () => {
      mockGetNotifications.mockResolvedValue({
        data: [makeNotification({ type: "user_followed" })],
      });

      renderPage();

      const buttons = await screen.findAllByRole("button", { name: /follow back/i });
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("changes to Following after click", async () => {
      mockGetNotifications.mockResolvedValue({
        data: [makeNotification({ type: "user_followed", actorId: "u1" })],
      });

      renderPage();

      const buttons = await screen.findAllByRole("button", { name: /follow back/i });

      fireEvent.click(buttons[0]); // click main list button

      await waitFor(() => {
        expect(
          screen.getAllByRole("button", { name: /following/i }).length
        ).toBeGreaterThan(0);
      });
    });
  });

  describe("filter dropdown", () => {
    beforeEach(() => {
      mockGetNotifications.mockResolvedValue({ data: [] });
    });

    it("opens and closes", async () => {
      renderPage();

      await screen.findByText(/no notifications/i);

      const trigger = screen.getByRole("button", { name: /all notifications/i });
      fireEvent.click(trigger);

      expect(screen.getByRole("button", { name: "Likes" })).toBeInTheDocument();

      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(
          screen.queryByRole("button", { name: "Likes" })
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("sidebar", () => {
    it("renders when follow notifications exist", async () => {
      mockGetNotifications.mockResolvedValue({
        data: [makeNotification({ type: "user_followed" })],
      });

      renderPage();

      expect(await screen.findByText(/recent followers/i))
        .toBeInTheDocument();
    });

    it("caps at 3 entries", async () => {
      mockGetNotifications.mockResolvedValue({
        data: [
          makeNotification({ id: "1", type: "user_followed" }),
          makeNotification({ id: "2", type: "user_followed" }),
          makeNotification({ id: "3", type: "user_followed" }),
          makeNotification({ id: "4", type: "user_followed" }),
        ],
      });

      renderPage();

      const sidebarTitle = await screen.findByText(/recent followers/i);
      const sidebar = sidebarTitle.parentElement?.parentElement!;

      const { getAllByRole } = within(sidebar);

      const followButtons = getAllByRole("button", { name: /follow back/i });

      expect(followButtons.length).toBe(3);
    });
  });

  describe("profile links", () => {
    it("links to user profile", async () => {
      mockGetNotifications.mockResolvedValue({
        data: [makeNotification({ actorId: "user-42", username: "alice" })],
      });

      renderPage();

      const link = await screen.findByRole("link", { name: "alice" });
      expect(link).toHaveAttribute("href", "/users/user-42");
    });
  });

});