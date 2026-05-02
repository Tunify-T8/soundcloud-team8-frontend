import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SubscriptionBadge from "../components/SubscriptionBadge";
import ArtistProUpgradeButton from "../components/ArtistProUpgradeButton";
import PaymentFailedBanner from "../components/PaymentFailedBanner";
import PaymentSuccessModal from "../components/PaymentSuccessModal";
import { PremiumComingSoonModal, MasteringEligibilityModal } from "../components/TrackActionModals";
import PlanCard from "../pages/PlanCard";
import PromoPage from "../pages/PromoPage";
import Mastering from "../pages/Mastering";
import InsightsOverviewPage from "@/features/insights/components/InsightsOverviewPage";
import { renderWithProviders } from "@/test/renderWithProviders";

const mockNavigate = vi.fn();
const mockUseMe = vi.fn();
const mockUseSubscription = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/features/premium/components/CheckoutModal", () => ({
  default: ({ plan }: { plan: string }) => <div data-testid="checkout-modal">{plan}</div>,
}));

vi.mock("@/features/profile/context/useMe", () => ({
  useMe: () => mockUseMe(),
}));

vi.mock("@/hooks/useSubscription", () => ({
  useSubscription: () => mockUseSubscription(),
}));

describe("premium extras", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockUseMe.mockReturnValue({
      subscription: { tier: "free" },
    });
    mockUseSubscription.mockReturnValue({
      tier: "free",
      isArtistPro: false,
    });
  });

  it("renders the expected SubscriptionBadge variants", () => {
    const { rerender } = render(<SubscriptionBadge tier="artist" />);
    expect(screen.getByLabelText(/artist badge/i)).toBeInTheDocument();

    rerender(<SubscriptionBadge tier="artist-pro" />);
    expect(screen.getByLabelText(/artist pro badge/i)).toBeInTheDocument();

    rerender(<SubscriptionBadge tier="free" />);
    expect(document.body).not.toHaveTextContent("badge");
  });

  it("opens checkout from ArtistProUpgradeButton for non-pro users", async () => {
    render(<ArtistProUpgradeButton>Upgrade</ArtistProUpgradeButton>);

    await userEvent.click(screen.getByRole("button", { name: "Upgrade" }));
    expect(screen.getByTestId("checkout-modal")).toHaveTextContent("artist-pro");
  });

  it("renders PaymentFailedBanner actions", async () => {
    const onDismiss = vi.fn();
    const onRetry = vi.fn();
    render(<PaymentFailedBanner onDismiss={onDismiss} onRetry={onRetry} />);

    await userEvent.click(screen.getByRole("button", { name: /try a different card/i }));
    await userEvent.click(screen.getAllByRole("button")[1]);

    expect(onRetry).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalled();
  });

  it("closes PaymentSuccessModal on Escape", () => {
    const onClose = vi.fn();
    render(<PaymentSuccessModal plan="artist" onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("opens checkout from PremiumComingSoonModal monetization flow", async () => {
    render(
      <PremiumComingSoonModal
        featureLabel="Monetization"
        onClose={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /get started/i }));
    expect(screen.getByTestId("checkout-modal")).toHaveTextContent("artist-pro");
  });

  it("navigates from MasteringEligibilityModal", async () => {
    render(<MasteringEligibilityModal onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /upload a new track/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/upload");
  });

  it("renders PlanCard using the current subscription tier", () => {
    mockUseSubscription.mockReturnValue({
      tier: "artist",
      isArtistPro: false,
    });

    render(<PlanCard />);
    expect(screen.getByText("Current plans")).toBeInTheDocument();
    expect(screen.getByText("Artist")).toBeInTheDocument();
  });

  it("opens checkout from PromoPage distribution", async () => {
    renderWithProviders(<PromoPage />, { route: "/distribution/soundcloud" });

    await userEvent.click(
      screen.getAllByRole("button", { name: /get started/i })[0],
    );
    expect(screen.getByTestId("checkout-modal")).toHaveTextContent("artist-pro");
  });

  it("opens the Mastering modal", async () => {
    render(<Mastering />);

    await userEvent.click(screen.getByRole("button", { name: /get started/i }));
    expect(screen.getByText(/choose a track to master/i)).toBeInTheDocument();
  });

  it("switches tabs in InsightsOverviewPage", async () => {
    renderWithProviders(<InsightsOverviewPage />, { route: "/me/insights/overview" });

    expect(screen.getByText(/looks like there is no activity/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /all platforms/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/me/insights/all-platforms");
  });
});
