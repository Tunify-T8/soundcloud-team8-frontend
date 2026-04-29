import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import UserInfoBar from "../../../components/UserInfo/UserInfoBar";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "@/store/userSlice";

describe("UserInfoBar", () => {
  const renderWithStore = (ui: React.ReactElement, role: string | null = null) => {
    const store = configureStore({
      reducer: {
        user: userReducer,
      },
    });

    if (role) {
      store.dispatch({
        type: "user/setUser",
        payload: {
          id: "admin-user",
          username: "admin",
          displayName: "Admin User",
          email: "admin@test.com",
          role,
          isVerified: true,
          avatarUrl: null,
        },
      });
    }

    return render(<Provider store={store}>{ui}</Provider>);
  };

  it("renders all tabs", () => {
    renderWithStore(
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
    renderWithStore(
      <MemoryRouter>
        <UserInfoBar isMe displayName="John" />
      </MemoryRouter>,
    );
    expect(screen.getByText(/edit/i)).toBeInTheDocument();
  });

  it("opens EditInfo modal on Edit click", () => {
    renderWithStore(
      <MemoryRouter>
        <UserInfoBar isMe displayName="John" />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText(/edit/i));
    expect(screen.getByText(/edit your profile/i)).toBeInTheDocument();
  });

  it("shows the viewed profile id for admins", () => {
    const { container } = renderWithStore(
      <MemoryRouter>
        <UserInfoBar userId="profile-123" displayName="John" />
      </MemoryRouter>,
      "admin",
    );

    expect(container.querySelector('[title="Profile ID: profile-123"]')).toBeInTheDocument();
  });
});
