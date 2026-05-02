import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Spotlight from "../components/Spotlight";

vi.mock("@/assets/spotlight.png", () => ({
  default: "mocked-image.png",
}));

describe("Spotlight Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders Spotlight title", () => {
    render(<Spotlight />);
    expect(screen.getByText("Spotlight")).toBeInTheDocument();
  });

  it("shows promo by default", () => {
    render(<Spotlight />);
    expect(
      screen.getByText("Get more plays with Spotlight!")
    ).toBeInTheDocument();
  });

  it("hides promo when close button is clicked", () => {
    render(<Spotlight isMe />);

    const closeBtn = screen.getAllByRole("button").find((btn) =>
      btn.querySelector("svg")
    );

    expect(closeBtn).toBeTruthy();

    fireEvent.click(closeBtn!);

    expect(
      screen.queryByText("Get more plays with Spotlight")
    ).not.toBeInTheDocument();
  });

  it("shows Edit Spotlight button when isMe=true and promo hidden", () => {
    render(<Spotlight isMe />);

    // close promo first
    const closeBtn = screen.getAllByRole("button").find((btn) =>
      btn.querySelector("svg")
    );
    fireEvent.click(closeBtn!);

    expect(screen.getByText("Edit Spotlight")).toBeInTheDocument();
  });

  it("does NOT show Edit button when isMe=false", () => {
    render(<Spotlight isMe={false} />);

    expect(
      screen.queryByText("Edit Spotlight")
    ).not.toBeInTheDocument();
  });

  it("shows popover on hover and hides after delay", () => {
    vi.useFakeTimers();

    render(<Spotlight isMe />);

    // hover edit button inside promo
    const editBtn = screen.getByText("Edit Spotlight");

    fireEvent.mouseEnter(editBtn);

    expect(
      screen.getByText(/Upgrade to Artist or Artist Pro/)
    ).toBeInTheDocument();

    fireEvent.mouseLeave(editBtn);

    act(() => {
      vi.advanceTimersByTime(130);
    });

    expect(
      screen.queryByText(/Upgrade to Artist or Artist Pro/)
    ).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it("keeps popover open if mouse enters it before timeout", () => {
    vi.useFakeTimers();

    render(<Spotlight isMe />);

    const editBtn = screen.getByText("Edit Spotlight");

    fireEvent.mouseEnter(editBtn);

    const popoverText = screen.getByText(
      /Upgrade to Artist or Artist Pro/
    );

    fireEvent.mouseLeave(editBtn);

    // simulate entering popover before timeout ends
    fireEvent.mouseEnter(popoverText);

    act(() => {
      vi.advanceTimersByTime(130);
    });

    expect(
      screen.getByText(/Upgrade to Artist or Artist Pro/)
    ).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("calls window.open when clicking Get Spotlight", () => {
    const openMock = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<Spotlight />);

    const btn = screen.getByText("Get Spotlight");

    fireEvent.click(btn);

    expect(openMock).toHaveBeenCalledWith("/plans", "_blank");
  });
});

//npm run test -- src/features/premium/tests/Spotlight.test.tsx
