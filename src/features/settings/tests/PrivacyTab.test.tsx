import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PrivacyTab from "../tabs/PrivacyTab";
import { profileService } from "../../profile/profileService";

vi.mock("../../profile/profileService", () => ({
  profileService: {
    getBlockedUsers: vi.fn(),
  },
}));

const toggleIds = [
  "privacy-toggle-receive-messages",
  "privacy-toggle-show-activities",
  "privacy-toggle-show-first-top-fan",
  "privacy-toggle-show-fans-for-tracks",
];

describe("PrivacyTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(profileService.getBlockedUsers).mockImplementation(
      () => new Promise(() => undefined),
    );
  });

  it("renders all toggles in ON state by default", () => {
    render(<PrivacyTab />);

    toggleIds.forEach((id) => {
      expect(screen.getByTestId(id)).toHaveAttribute("aria-checked", "true");
    });
  });

  it("clicking a toggle switches it from ON to OFF", () => {
    render(<PrivacyTab />);

    const toggle = screen.getByTestId("privacy-toggle-receive-messages");
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("clicking again switches it back to ON", () => {
    render(<PrivacyTab />);

    const toggle = screen.getByTestId("privacy-toggle-receive-messages");
    fireEvent.click(toggle);
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("maps blocked users in blocked users section", async () => {
    vi.mocked(profileService.getBlockedUsers).mockResolvedValueOnce({
      page: 1,
      limit: 20,
      total: 1,
      blockedUsers: [
        {
          id: "blocked-user-1",
          username: "blocked_user",
          avatarUrl: "https://example.com/avatar.png",
          blockedAt: "2026-04-29T00:00:00.000Z",
        },
      ],
    });

    render(<PrivacyTab />);

    expect(await screen.findByTestId("settings-blocked-users-list")).toBeInTheDocument();
    expect(screen.getByText("blocked_user")).toBeInTheDocument();
  });
});
