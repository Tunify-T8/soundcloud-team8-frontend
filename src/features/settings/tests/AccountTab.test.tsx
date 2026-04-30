import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import AccountTab from "../tabs/AccountTab";

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

  it("renders theme radio buttons and selects Dark by default", () => {
    renderAccount();

    expect(screen.getByTestId("theme-radio-light")).toBeInTheDocument();
    expect(screen.getByTestId("theme-radio-dark")).toBeChecked();
  });

  it("selecting Light theme applies data-theme light and persists it", () => {
    renderAccount();

    fireEvent.click(screen.getByTestId("theme-radio-light"));

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem("sc-theme")).toBe("light");
  });

  it("selecting Dark theme applies data-theme dark", () => {
    renderAccount();

    fireEvent.click(screen.getByTestId("theme-radio-light"));
    fireEvent.click(screen.getByTestId("theme-radio-dark"));

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("clicking Add an email address shows the email input form", () => {
    renderAccount();

    fireEvent.click(screen.getByTestId("email-add-button"));

    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("email-submit-button")).toBeInTheDocument();
    expect(screen.getByTestId("email-cancel-button")).toBeInTheDocument();
  });

  it("clicking Cancel hides the email form and shows the button again", () => {
    renderAccount();

    fireEvent.click(screen.getByTestId("email-add-button"));
    fireEvent.click(screen.getByTestId("email-cancel-button"));

    expect(screen.queryByTestId("email-input")).not.toBeInTheDocument();
    expect(screen.getByTestId("email-add-button")).toBeInTheDocument();
  });

  it("month dropdown includes a greyed placeholder and updates displayed value", () => {
    renderAccount();

    fireEvent.click(screen.getByTestId("birthdate-month"));
    expect(screen.getByRole("button", { name: "Month" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "January" }));
    fireEvent.click(screen.getByTestId("birthdate-month"));
    fireEvent.click(screen.getByRole("button", { name: "June" }));

    expect(screen.getByTestId("birthdate-month")).toHaveTextContent("June");
  });

  it("day dropdown includes a greyed placeholder and updates displayed value", () => {
    renderAccount();

    fireEvent.click(screen.getByTestId("birthdate-day"));
    expect(screen.getByRole("button", { name: "Day" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "2" }));

    expect(screen.getByTestId("birthdate-day")).toHaveTextContent("2");
  });

  it("year dropdown shows years descending and 1999 is default", () => {
    renderAccount();

    expect(screen.getByTestId("birthdate-year")).toHaveTextContent("1999");
    fireEvent.click(screen.getByTestId("birthdate-year"));

    const dropdown = screen.getByTestId("birthdate-year").parentElement!;
    const buttons = within(dropdown).getAllByRole("button").map((button) => button.textContent);
    expect(buttons).toContain("Year");
    expect(buttons.indexOf("2013")).toBeLessThan(buttons.indexOf("2012"));
    expect(buttons.indexOf("2012")).toBeLessThan(buttons.indexOf("2011"));
  });

  it("gender dropdown shows all five options when opened", () => {
    renderAccount();

    fireEvent.click(screen.getByTestId("gender-select"));

    expect(screen.getAllByText("Indicate gender").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByTestId("gender-option-female")).toBeInTheDocument();
    expect(screen.getByTestId("gender-option-male")).toBeInTheDocument();
    expect(screen.getByTestId("gender-option-prefer-not-to-say")).toBeInTheDocument();
    expect(screen.getByTestId("gender-option-custom")).toBeInTheDocument();
  });

  it("only keeps one basic information dropdown open at a time", () => {
    renderAccount();

    fireEvent.click(screen.getByTestId("birthdate-month"));
    expect(screen.getByRole("button", { name: "Month" })).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("birthdate-day"));

    expect(screen.queryByRole("button", { name: "Month" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Day" })).toBeInTheDocument();
  });

  it("clicking Request verification navigates to the verification page", () => {
    renderAccount();

    fireEvent.click(screen.getByTestId("verification-request-button"));

    expect(screen.getByTestId("verification-route")).toBeInTheDocument();
    expect(screen.getByTestId("current-path")).toHaveTextContent("/settings/verification");
  });
});
