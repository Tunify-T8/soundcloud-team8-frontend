import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { describe, it, expect } from "vitest";
import EditInfo from "../../../components/UserInfo/EditInfo";

describe("EditInfo", () => {
  it("renders with displayName and avatar", () => {
    render(
      <EditInfo onClick={() => {}} displayName="John" avatarUrl="avatar.jpg" />,
    );
    expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    expect(screen.getByAltText("Avatar")).toBeInTheDocument();
  });

  it("shows link inputs when Add link is clicked", () => {
    render(<EditInfo onClick={() => {}} />);
    // There are multiple 'Add link' texts, so click the button only
    const addLinkButtons = screen.getAllByText(/add link/i);
    // Find the button element
    const addLinkButton = addLinkButtons.find((el) => el.tagName === "BUTTON");
    expect(addLinkButton).toBeDefined();
    fireEvent.click(addLinkButton!);
    expect(screen.getByPlaceholderText(/facebook url/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/instagram url/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/twitter url/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/youtube url/i)).toBeInTheDocument();
  });

  it("calls onClick when Cancel is clicked", () => {
    const onClick = vi.fn();
    render(<EditInfo onClick={onClick} />);
    fireEvent.click(screen.getByText(/cancel/i));
    expect(onClick).toHaveBeenCalled();
  });
});
