import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import UpgradeModal from "../components/UpgradeModal";

describe("UpgradeModal", () => {
  it("renders modal content", () => {
    render(<UpgradeModal onClose={() => {}} />);

    expect(
      screen.getByText("Unlock artist tools and reach more listeners")
    ).toBeInTheDocument();

    expect(screen.getByText("Artist")).toBeInTheDocument();
    expect(screen.getByText("Artist Pro")).toBeInTheDocument();
  });

  it("calls onClose when clicking close button", () => {
    const onClose = vi.fn();
    render(<UpgradeModal onClose={onClose} />);

    const closeBtn = screen.getAllByRole("button")[0];
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when clicking backdrop", () => {
    const onClose = vi.fn();
    render(<UpgradeModal onClose={onClose} />);

    const backdrop = document.querySelector(".fixed.inset-0") as HTMLElement;
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalled();
  });

  it("opens checkout modal when clicking Artist plan", async () => {
    render(<UpgradeModal onClose={() => {}} />);

    fireEvent.click(screen.getAllByText("Get started")[0]);

    expect(await screen.findByText("Get Artist")).toBeInTheDocument();
  });

  it("opens checkout modal when clicking Artist Pro plan", async () => {
    render(<UpgradeModal onClose={() => {}} />);

    fireEvent.click(screen.getByText("Start 7-day free trial"));

    expect(await screen.findByText("Get Artist Pro")).toBeInTheDocument();
  });

  it("closes on Escape key", () => {
    const onClose = vi.fn();
    render(<UpgradeModal onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalled();
  });
});

//npm run test -- src/features/premium/tests/UpgradeModal.test.tsx
