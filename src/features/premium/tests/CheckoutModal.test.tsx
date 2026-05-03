import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CheckoutModal from "../components/CheckoutModal";

// mock images
vi.mock("@/assets/silhouette.png", () => ({ default: "img.png" }));
vi.mock("@/assets/lock.png", () => ({ default: "lock.png" }));

describe("CheckoutModal", () => {
  it("renders correct plan info", () => {
    render(<CheckoutModal plan="artist" onClose={() => {}} />);

    expect(screen.getByText("Get Artist")).toBeInTheDocument();
    expect(screen.getByText("Artist")).toBeInTheDocument();
  });

  it("calls onClose when clicking close button", () => {
    const onClose = vi.fn();
    render(<CheckoutModal plan="artist" onClose={onClose} />);

    const closeBtn = screen.getAllByRole("button")[0];
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it("switches billing cycle", () => {
    render(<CheckoutModal plan="artist" onClose={() => {}} />);

    fireEvent.click(screen.getByText("Monthly billing"));

    expect(screen.getByText("Monthly billing")).toBeInTheDocument();
  });

  it("selects card payment and shows inputs", async () => {
    render(<CheckoutModal plan="artist" onClose={() => {}} />);

    fireEvent.click(screen.getByText("Card"));

    expect(await screen.findByPlaceholderText("First name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Card number")).toBeInTheDocument();
  });

  it("shows validation errors when empty card inputs are blurred", async () => {
    render(<CheckoutModal plan="artist" onClose={() => {}} />);

    fireEvent.click(screen.getByText("Card"));
    fireEvent.blur(screen.getByPlaceholderText("First name"));
    fireEvent.blur(screen.getByPlaceholderText("Surname"));

    expect(await screen.findByText("Enter the first name on the card")).toBeInTheDocument();
    expect(screen.getByText("Enter the last name on the card")).toBeInTheDocument();
  });

  it("closes on Escape key", () => {
    const onClose = vi.fn();
    render(<CheckoutModal plan="artist" onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalled();
  });
});

//npm run test -- src/features/premium/tests/CheckoutModal.test.tsx
