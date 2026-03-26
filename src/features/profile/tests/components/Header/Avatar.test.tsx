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

  it("shows upload button if editable and no avatar exists", () => {
    render(<Avatar displayName="Jane" isMe />);
    expect(screen.getByText(/upload image/i)).toBeInTheDocument();
  });

  it("toggles actions on update button click when avatar exists", () => {
    render(<Avatar avatarUrl="test.jpg" displayName="Jane" isMe />);
    const updateBtn = screen.getByText(/update image/i);
    fireEvent.click(updateBtn);
    expect(screen.getByText(/replace image/i)).toBeInTheDocument();
    expect(screen.getByText(/delete image/i)).toBeInTheDocument();
  });
});
