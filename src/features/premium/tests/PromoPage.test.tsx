import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PromoPage from "../pages/PromoPage";
import { renderWithProviders } from "@/test/renderWithProviders";

vi.mock("@/features/premium/components/CheckoutModal", () => ({
  default: ({ plan }: { plan: string }) => (
    <div data-testid="checkout-modal">{plan}</div>
  ),
}));

describe("PromoPage", () => {
  it("renders the distribution page when opened on a distribution route", () => {
    renderWithProviders(<PromoPage />, { route: "/distribution/soundcloud" });

    expect(screen.getByText(/distribute your music to/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /distribution faqs/i }),
    ).toBeInTheDocument();
  });

  it("renders the monetization page when opened on a monetization route", () => {
    renderWithProviders(<PromoPage />, { route: "/monetization/soundcloud" });

    expect(
      screen.getByText(/get paid for your plays on soundcloud/i),
    ).toBeInTheDocument();
  });

  it("switches pages from the sidebar navigation", async () => {
    renderWithProviders(<PromoPage />, { route: "/distribution/soundcloud" });

    await userEvent.click(screen.getByRole("button", { name: "Tracks" }));

    expect(screen.getByText("Your Tracks")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /upload a track/i }),
    ).toBeInTheDocument();
  });

  it("opens the artist pro checkout from a get started button", async () => {
    renderWithProviders(<PromoPage />, { route: "/distribution/soundcloud" });

    await userEvent.click(
      screen.getAllByRole("button", { name: /get started/i })[0],
    );

    expect(screen.getByTestId("checkout-modal")).toHaveTextContent(
      "artist-pro",
    );
  });
});
