import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Avatar from "../../../components/Header/Avatar";

describe("Avatar", () => {
  it("renders with displayName initial", () => {
    render(<Avatar displayName="John Doe" />);
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("renders with avatarUrl", () => {
    render(<Avatar avatarUrl="test.jpg" displayName="Jane" />);
    expect(screen.getByAltText("Avatar")).toHaveAttribute("src", "test.jpg");
  });

  it("shows update button if editable", () => {
    render(<Avatar displayName="Jane" isEditable />);
    expect(screen.getByText(/update image/i)).toBeInTheDocument();
  });

  it("toggles actions on update button click", () => {
    render(<Avatar displayName="Jane" isEditable />);
    const updateBtn = screen.getByText(/update image/i);
    fireEvent.click(updateBtn);
    expect(screen.getByText(/replace image/i)).toBeInTheDocument();
    expect(screen.getByText(/delete image/i)).toBeInTheDocument();
  });
});
