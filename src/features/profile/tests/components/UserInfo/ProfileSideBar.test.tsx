import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProfileSideBar from "../../../components/UserInfo/ProfileSideBar";
import { MemoryRouter } from "react-router-dom";

describe("ProfileSideBar", () => {
  it("renders user info stats", () => {
    render(
      <MemoryRouter>
        <ProfileSideBar followers={10} following={5} tracks={3} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Followers")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Following")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Tracks")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders bio and social links", () => {
    render(
      <MemoryRouter>
        <ProfileSideBar
          bio="Test bio"
          socialAccounts={{
            facebook: "fb",
            instagram: "ig",
            twitter: "tw",
            youtube: "yt",
          }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText("Test bio")).toBeInTheDocument();
    expect(screen.getByText(/facebook/i)).toBeInTheDocument();
    expect(screen.getByText(/instagram/i)).toBeInTheDocument();
    expect(screen.getByText(/twitter/i)).toBeInTheDocument();
    expect(screen.getByText(/youtube/i)).toBeInTheDocument();
  });
});
