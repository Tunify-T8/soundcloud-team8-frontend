import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import ProfilePage from "../../pages/ProfilePage";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import * as profileServiceModule from "../../profileService";

describe("ProfilePage", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("renders user profile with all sections", async () => {
    vi.spyOn(
      profileServiceModule.profileService,
      "getUserByUsername",
    ).mockResolvedValue({
      id: "1",
      displayName: "Test User",
      username: "testuser",
      country: "Testland",
      city: "Test City",
      isVerified: true,
      avatarUrl: "avatar.jpg",
      coverUrl: "cover.jpg",
      isEditable: true,
      followersCount: 10,
      followingCount: 5,
      tracksCount: 3,
      bio: "Test bio",
      socialAccounts: {
        facebook: "fb",
        instagram: "ig",
        twitter: "tw",
        youtube: "yt",
      },
      role: "user",
      createdAt: "2024-01-01T00:00:00Z",
    });
    vi.spyOn(
      profileServiceModule.profileService,
      "getCurrentUser",
    ).mockResolvedValue(null);
    vi.spyOn(
      profileServiceModule.profileService,
      "getFollowing",
    ).mockResolvedValue([]);
    render(
      <MemoryRouter initialEntries={["/profile/testuser"]}>
        <Routes>
          <Route path="/profile/:username" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>,
    );
    // Wait for loading to finish
    expect(await screen.findByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("testuser")).toBeInTheDocument();
    // Use a function matcher for location
    expect(
      screen.getByText((content, node) => {
        const hasText = (node: Element) =>
          node.textContent === "Testland, " || node.textContent === "Test City";
        const nodeHasText = hasText(node as Element);
        const childrenDontHaveText = Array.from(node?.children || []).every(
          (child) => !hasText(child as Element),
        );
        return nodeHasText && childrenDontHaveText;
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Test bio")).toBeInTheDocument();
    expect(screen.getByText(/facebook/i)).toBeInTheDocument();
    expect(screen.getByText(/instagram/i)).toBeInTheDocument();
    expect(screen.getByText(/twitter/i)).toBeInTheDocument();
    expect(screen.getByText(/youtube/i)).toBeInTheDocument();
  });

  it("shows 'User not found.' if no user", async () => {
    vi.spyOn(
      profileServiceModule.profileService,
      "getUserByUsername",
    ).mockResolvedValue(null);
    vi.spyOn(
      profileServiceModule.profileService,
      "getCurrentUser",
    ).mockResolvedValue(null);
    vi.spyOn(
      profileServiceModule.profileService,
      "getFollowing",
    ).mockResolvedValue([]);
    render(
      <MemoryRouter initialEntries={["/profile/unknown"]}>
        <Routes>
          <Route path="/profile/:username" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText("User not found.")).toBeInTheDocument();
  });
});
