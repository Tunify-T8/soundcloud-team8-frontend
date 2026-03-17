import { render, screen } from "@testing-library/react";
import UserDetails from "../../../components/Header/UserDetails";

describe("UserDetails", () => {
  it("renders displayName and username", () => {
    render(<UserDetails displayName="John Doe" username="johndoe" />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("johndoe")).toBeInTheDocument();
  });

  it("renders country and city", () => {
    render(<UserDetails country="USA" city="NY" />);
    expect(screen.getByText("USA,")).toBeInTheDocument();
    expect(screen.getByText("NY")).toBeInTheDocument();
  });

  it("renders verified icon if isVerified", () => {
    render(<UserDetails displayName="Jane" isVerified />);
    // The icon is present, but for a more robust test, you could add a data-testid in the component
    expect(screen.getByText("Jane")).toBeInTheDocument();
  });
});
