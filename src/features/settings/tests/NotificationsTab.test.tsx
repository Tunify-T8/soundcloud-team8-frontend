import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotificationsTab from "../tabs/NotificationsTab";

const checkedIds = [
  "notification-new-follower-email",
  "notification-new-follower-devices",
  "notification-repost-email",
  "notification-repost-devices",
  "notification-new-post-email",
  "notification-new-post-devices",
  "notification-likes-plays-email",
  "notification-likes-plays-devices",
  "notification-comment-devices",
  "notification-recommended-email",
  "notification-recommended-devices",
  "notification-new-message-email",
  "notification-feature-updates-email",
  "notification-feature-updates-devices",
  "notification-surveys-devices",
  "notification-promotional-email",
  "notification-promotional-devices",
];

const uncheckedIds = [
  "notification-comment-email",
  "notification-surveys-email",
  "notification-newsletter-email",
];

describe("NotificationsTab", () => {
  it("renders all checkbox states correctly", () => {
    render(<NotificationsTab />);

    checkedIds.forEach((id) => {
      expect(screen.getByTestId(id)).toBeChecked();
    });

    uncheckedIds.forEach((id) => {
      expect(screen.getByTestId(id)).not.toBeChecked();
    });

    expect(screen.getByTestId("notification-new-message-devices-dropdown")).toBeInTheDocument();
  });

  it("clicking an unchecked checkbox checks it", () => {
    render(<NotificationsTab />);

    const checkbox = screen.getByTestId("notification-comment-email");
    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it("clicking a checked checkbox unchecks it", () => {
    render(<NotificationsTab />);

    const checkbox = screen.getByTestId("notification-new-follower-email");
    fireEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
  });
});
