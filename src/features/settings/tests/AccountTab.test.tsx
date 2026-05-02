import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import AccountTab from "../tabs/AccountTab";

vi.mock("../components/DeleteAccountModal", () => ({
  default: () => <div data-testid="delete-account-modal" />,
}));

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="current-path">{location.pathname}</span>;
}

function renderAccount() {
  return render(
    <MemoryRouter initialEntries={["/settings"]}>
      <Routes>
        <Route
          path="/settings"
          element={
            <>
              <AccountTab />
              <LocationProbe />
            </>
          }
        />
        <Route
          path="/settings/verification"
          element={
            <>
              <div data-testid="verification-route" />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AccountTab", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("renders theme controls with dark selected by default", () => {
    renderAccount();

    expect(screen.getByTestId("theme-radio-light")).toBeInTheDocument();
    expect(screen.getByTestId("theme-radio-dark")).toBeChecked();
  });

  it("persists the selected theme", () => {
    renderAccount();

    fireEvent.click(screen.getByTestId("theme-radio-light"));

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem("sc-theme")).toBe("light");
  });

  it("shows and hides the email form", () => {
    renderAccount();

    fireEvent.click(screen.getByTestId("email-add-button"));
    expect(screen.getByTestId("email-input")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("email-cancel-button"));
    expect(screen.queryByTestId("email-input")).not.toBeInTheDocument();
  });

  it("updates the month dropdown selection", () => {
    renderAccount();

    fireEvent.click(screen.getByTestId("birthdate-month"));
    fireEvent.click(screen.getByRole("button", { name: "January" }));

    expect(screen.getByTestId("birthdate-month")).toHaveTextContent("January");
  });

  it("opens the gender dropdown with the current options", () => {
    renderAccount();

    fireEvent.click(screen.getByTestId("gender-select"));

    expect(screen.getByTestId("gender-option-female")).toBeInTheDocument();
    expect(screen.getByTestId("gender-option-male")).toBeInTheDocument();
    expect(screen.getByTestId("gender-option-prefer-not-to-say")).toBeInTheDocument();
    expect(screen.getByTestId("gender-option-custom")).toBeInTheDocument();
  });

  it("navigates to the verification route", () => {
    renderAccount();

    fireEvent.click(screen.getByTestId("verification-request-button"));

    expect(screen.getByTestId("verification-route")).toBeInTheDocument();
    expect(screen.getByTestId("current-path")).toHaveTextContent("/settings/verification");
  });
});
