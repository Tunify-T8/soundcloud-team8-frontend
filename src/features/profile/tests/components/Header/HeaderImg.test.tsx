import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HeaderImg from "../../../components/Header/HeaderImg";

describe("HeaderImg", () => {
  it("renders with coverUrl", () => {
    render(<HeaderImg coverUrl="cover.jpg" />);
    const img = screen.getByAltText("Header");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "cover.jpg");
  });

  it("shows upload label if editable", () => {
    render(<HeaderImg isMe />);
    expect(screen.getByText(/upload header image/i)).toBeInTheDocument();
  });
});
