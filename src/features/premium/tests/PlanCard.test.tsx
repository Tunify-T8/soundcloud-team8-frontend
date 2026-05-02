import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import PlanCard from "../components/PlanCard";

const mockUseSubscription = vi.fn();

vi.mock("@/hooks/useSubscription", () => ({
  useSubscription: () => mockUseSubscription(),
}));

vi.mock("@/features/premium/components/ArtistProUpgradeButton", () => ({
  default: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/features/premium/components/SubscriptionBadge", () => ({
  default: ({ tier }: { tier: string }) => (
    <div data-testid="subscription-badge">{tier}</div>
  ),
}));

describe("PlanCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the basic plan state for free users", () => {
    mockUseSubscription.mockReturnValue({
      tier: "free",
      isArtistPro: false,
    });

    render(<PlanCard />);

    expect(screen.getByText("Current plans")).toBeInTheDocument();
    expect(screen.getByText("Basic")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try artist pro/i })).toBeInTheDocument();
    expect(screen.queryByTestId("subscription-badge")).not.toBeInTheDocument();
  });

  it("renders the artist plan with its badge", () => {
    mockUseSubscription.mockReturnValue({
      tier: "artist",
      isArtistPro: false,
    });

    render(<PlanCard />);

    expect(screen.getByText("Artist")).toBeInTheDocument();
    expect(screen.getByTestId("subscription-badge")).toHaveTextContent(
      "artist",
    );
    expect(screen.getByRole("button", { name: /try artist pro/i })).toBeInTheDocument();
  });

  it("renders the artist pro state without the upgrade button", () => {
    mockUseSubscription.mockReturnValue({
      tier: "artist",
      isArtistPro: true,
    });

    render(<PlanCard />);

    expect(screen.getByText("Artist Pro")).toBeInTheDocument();
    expect(screen.getByTestId("subscription-badge")).toHaveTextContent(
      "artist-pro",
    );
    expect(
      screen.queryByRole("button", { name: /try artist pro/i }),
    ).not.toBeInTheDocument();
  });
});
