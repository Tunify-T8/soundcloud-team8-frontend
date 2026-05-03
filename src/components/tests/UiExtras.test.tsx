import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import ShareOverlay from "../ui/ShareOverlay";
import UserResultRow from "../ui/UserResultRow";
import AuthNavbar from "@/features/auth/components/AuthNavbar";
import CaptchaField from "@/features/auth/components/CaptchaField";
import SignedOutPage from "@/features/auth/pages/SignedOutPage";
import { renderWithProviders } from "@/test/renderWithProviders";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ui extras", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("toggles tabs in ShareOverlay and closes from the backdrop", async () => {
    const onClose = vi.fn();
    render(<ShareOverlay onClose={onClose} shareUrl="https://example.com/track" />);

    expect(screen.getByDisplayValue("https://example.com/track")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Message" }));
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close share overlay/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("navigates to /me for the current user row", async () => {
    renderWithProviders(
      <UserResultRow
        user={{
          id: "user-1",
          username: "nada",
          displayName: "Nada",
          followersCount: 120,
          isCertified: true,
          bio: "bio",
        }}
      />,
      {
        preloadedState: {
          user: {
            currentUser: {
              id: "user-1",
              username: "nada",
              email: "nada@example.com",
              role: "listener",
              isVerified: true,
              avatarUrl: null,
            },
          },
        },
      },
    );

    await userEvent.click(screen.getByTestId("user-result-row-user-1"));
    expect(mockNavigate).toHaveBeenCalledWith("/me");
  });

  it("renders AuthNavbar links and triggers create account", async () => {
    const onCreateAccount = vi.fn();
    render(
      <MemoryRouter>
        <AuthNavbar onCreateAccount={onCreateAccount} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("navHomeLink")).toBeInTheDocument();
    expect(screen.getByTestId("navSignInLink")).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("navCreateAccountBtn"));
    expect(onCreateAccount).toHaveBeenCalled();
  });

  it("forwards CaptchaField changes", async () => {
    const onChange = vi.fn();
    render(<CaptchaField value="" onChange={onChange} />);

    fireEvent.change(screen.getByTestId("captcha-honeypot"), {
      target: { value: "spam" },
    });
    expect(onChange).toHaveBeenLastCalledWith("spam");
  });

  it("switches platform tabs in SignedOutPage", async () => {
    render(
      <MemoryRouter>
        <SignedOutPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("authNavbar")).toBeInTheDocument();
    expect(screen.getByAltText("SoundCloud on iPad")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /android/i }));
    expect(screen.getByAltText("SoundCloud on Android tablet")).toBeInTheDocument();
  });
});
