import { render, screen } from "@testing-library/react";
import UserInfoBarTab from "../../../components/UserInfo/UsetInfoBarTab";

describe("UserInfoBarTab", () => {
  it("renders label", () => {
    render(<UserInfoBarTab label="Test Tab" />);
    expect(screen.getByText("Test Tab")).toBeInTheDocument();
  });

  it("applies active class when isActive", () => {
    render(<UserInfoBarTab label="Active Tab" isActive />);
    const btn = screen.getByText("Active Tab");
    expect(btn).toHaveClass("text-white");
  });
});
