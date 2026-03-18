import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import UserInfoBar from "../../../components/UserInfo/UserInfoBar";
import { MemoryRouter } from "react-router-dom";

describe("UserInfoBar", () => {
  it("renders all tabs", () => {
    render(
      <MemoryRouter>
        <UserInfoBar />
      </MemoryRouter>,
    );
    [
      "All",
      "Popular tracks",
      "Tracks",
      "Albums",
      "Playlists",
      "Reposts",
    ].forEach((tab) => {
      expect(screen.getByText(tab)).toBeInTheDocument();
    });
  });

  it("shows Edit button if editable", () => {
    render(
      <MemoryRouter>
        <UserInfoBar isEditable displayName="John" />
      </MemoryRouter>,
    );
    expect(screen.getByText(/edit/i)).toBeInTheDocument();
  });

  it("opens EditInfo modal on Edit click", () => {
    render(
      <MemoryRouter>
        <UserInfoBar isEditable displayName="John" />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText(/edit/i));
    expect(screen.getByText(/edit your profile/i)).toBeInTheDocument();
  });
});
