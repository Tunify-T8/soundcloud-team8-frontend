import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SettingsToggle from "../components/shared/SettingsToggle";
import SettingsSection from "../components/shared/SettingsSection";
import SettingsNav from "../components/SettingsNav";
import SettingsLayout from "../components/SettingsLayout";
import { renderWithProviders } from "@/test/renderWithProviders";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("settings extras", () => {
  it("toggles SettingsToggle state through onChange", async () => {
    const onChange = vi.fn();
    render(<SettingsToggle checked={false} onChange={onChange} data-testid="toggle" />);

    await userEvent.click(screen.getByTestId("toggle"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("renders SettingsSection with heading and content", () => {
    render(
      <SettingsSection title="Privacy" infoIcon data-testid="privacy-section">
        <p>Section content</p>
      </SettingsSection>,
    );

    expect(screen.getByTestId("privacy-section-heading")).toHaveTextContent("Privacy");
    expect(screen.getByText("Section content")).toBeInTheDocument();
  });

  it("marks the active SettingsNav tab and navigates on click", async () => {
    renderWithProviders(<SettingsNav />, { route: "/settings/privacy" });

    expect(screen.getByTestId("settings-tab-privacy")).toHaveTextContent("Privacy");
    await userEvent.click(screen.getByTestId("settings-tab-security"));
    expect(mockNavigate).toHaveBeenCalledWith("/settings/security");
  });

  it("renders SettingsLayout chrome and children", () => {
    renderWithProviders(
      <SettingsLayout>
        <div>Body content</div>
      </SettingsLayout>,
      { route: "/settings/account" },
    );

    expect(screen.getByTestId("settings-heading")).toHaveTextContent("Settings");
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });
});
