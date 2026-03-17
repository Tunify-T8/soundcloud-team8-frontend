import { render, screen } from "@testing-library/react";
import Header from "../../../components/Header/Header";

describe("Header", () => {
  it("renders displayName and username", () => {
    render(
      <Header
        displayName="John Doe"
        username="johndoe"
        country="USA"
        city="NY"
        isVerified
        avatarUrl="avatar.jpg"
        coverUrl="cover.jpg"
        isEditable
      />,
    );
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("johndoe")).toBeInTheDocument();
  });

  it("renders Avatar and HeaderImg", () => {
    render(
      <Header displayName="Jane" avatarUrl="avatar.jpg" coverUrl="cover.jpg" />,
    );
    expect(screen.getByAltText("Avatar")).toBeInTheDocument();
    expect(screen.getByAltText("Header"));
  });
});
