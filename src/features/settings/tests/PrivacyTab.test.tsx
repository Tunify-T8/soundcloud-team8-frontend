import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PrivacyTab from "../tabs/PrivacyTab";

const toggleIds = [
  "privacy-toggle-receive-messages",
  "privacy-toggle-show-activities",
  "privacy-toggle-show-first-top-fan",
  "privacy-toggle-show-fans-for-tracks",
];

describe("PrivacyTab", () => {
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
});
