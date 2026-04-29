import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import ChatWindow from "../components/ChatWindow";
import type { Message } from "../types";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Routes, Route } from "react-router-dom";

/* ---------------- MOCK HOOKS ---------------- */

vi.mock("../hooks/useConversationMessages", () => ({
  useConversationMessages: () => ({
    messages: [] as Message[],
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    loadEarlier: vi.fn(),
    refetch: vi.fn(),
    appendMessage: vi.fn(),
    replaceMessage: vi.fn(),
    confirmLatestMessage: vi.fn(),
    markLocalRead: vi.fn(),
  }),
}));

vi.mock("../hooks/useSocket", () => ({
  useSocket: () => ({
    sendMessage: vi.fn(),
    emitTypingStart: vi.fn(),
    emitTypingStop: vi.fn(),
    markMessageRead: vi.fn(),
    getSocketState: () => ({
      connected: true,
    }),
  }),
}));

const mockBlockUser = vi.fn().mockResolvedValue(undefined);

vi.mock("../conversationService", () => ({
  conversationService: {
    blockUser: mockBlockUser,
  },
}));

/* ---------------- SAFE REDUX MOCK ---------------- */

const store = configureStore({
  reducer: {
    user: () => ({
      currentUser: {
        id: "user1",
        displayName: "User One",
        username: "userone",
        avatarUrl: "avatar.jpg",
      },
    }),
  },
});

beforeEach(() => {
  if (!window.HTMLElement.prototype.scrollIntoView) {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  }
});

/* ---------------- WRAPPER ---------------- */

const renderWithProviders = () =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/chat/conv1"]}>
        <Routes>
          <Route path="/chat/:conversationId" element={<ChatWindow />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

/* ---------------- TESTS ---------------- */

describe("ChatWindow", () => {
  it("renders without crashing", () => {
    renderWithProviders();
    expect(screen.getByText("Conversation conv1")).toBeInTheDocument();
  });

  it("shows empty state", () => {
    renderWithProviders();
    expect(screen.getByText(/No messages yet\. Start the conversation!/i)).toBeInTheDocument();
  });

  it("opens the block dialog from the header and blocks the conversation", async () => {
    renderWithProviders();

    fireEvent.click(screen.getByRole("button", { name: /block user/i }));
    expect(screen.getByText("Block this user?")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /^block user$/i })[1]);

    await waitFor(() => {
      expect(mockBlockUser).toHaveBeenCalledWith("conv1");
    });
  });
});