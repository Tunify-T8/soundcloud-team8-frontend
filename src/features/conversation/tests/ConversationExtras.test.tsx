import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import AttachmentPicker from "../components/AttachmentPicker";
import ConversationListPanel from "../components/ConversationListPanel";
import NewMessageDialog from "../components/NewMessageDialog";
import MessagesPage from "../pages/MessagesPage";
import audioSourceReducer from "@/store/AudioSourceSlice";
import userReducer from "@/store/userSlice";
import queueReducer from "@/store/queueSlice";
import playContextReducer from "@/store/playContextSlice";

const mockNavigate = vi.fn();
const mockCreateConversation = vi.fn();
const mockMarkConversationAsRead = vi.fn(() => Promise.resolve());
const mockSetConversations = vi.fn();
const mockRefetch = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../hooks/useAttachmentPicker", () => ({
  useAttachmentPicker: () => ({
    uploadedTracks: [{ id: "t1", type: "TRACK_UPLOAD", title: "Track One", coverUrl: null }],
    likedTracks: [],
    collections: [],
    isLoading: false,
    error: null,
  }),
}));

vi.mock("../hooks/useFollowingSuggestions", () => ({
  useFollowingSuggestions: () => ({
    suggestions: [{ id: "u1", displayName: "Nada", avatarUrl: null }],
    isLoading: false,
  }),
}));

vi.mock("../conversationService", () => ({
  conversationService: {
    createOrGetConversation: (...args: unknown[]) => mockCreateConversation(...args),
    markConversationAsRead: (...args: unknown[]) => mockMarkConversationAsRead(...args),
  },
}));

vi.mock("../components/ConversationListItem", () => ({
  default: ({ name, preview }: { name: string; preview: string }) => (
    <div>
      <span>{name}</span>
      <span>{preview}</span>
    </div>
  ),
}));

vi.mock("../components/ChatWindow", () => ({
  default: ({ conversationId }: { conversationId: string }) => <div data-testid="chat-window">{conversationId}</div>,
}));

vi.mock("../hooks/useConversationSummary", () => ({
  useConversationSummary: () => ({
    conversations: [
      {
        conversationId: "c1",
        otherUser: { displayName: "Nada", avatarUrl: null },
        lastMessagePreview: "Hello",
        lastMessageAt: new Date().toISOString(),
        unreadCount: 1,
      },
    ],
    setConversations: mockSetConversations,
    isLoading: false,
    error: null,
    refetch: mockRefetch,
  }),
}));

describe("conversation extras", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockCreateConversation.mockReset();
    mockCreateConversation.mockResolvedValue("conversation-1");
    mockSetConversations.mockReset();
    mockMarkConversationAsRead.mockClear();
    mockRefetch.mockReset();
  });

  it("selects an item from AttachmentPicker", async () => {
    const onSelect = vi.fn();
    render(<AttachmentPicker onSelect={onSelect} onClose={vi.fn()} />);

    await userEvent.click(screen.getByText("Track One"));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "t1", title: "Track One" }),
    );
  });

  it("opens the new message dialog from ConversationListPanel", async () => {
    render(
      <ConversationListPanel
        selectedConversationId={null}
        onSelectConversation={vi.fn()}
        conversations={[]}
        isLoading={false}
        error={null}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /new/i }));
    expect(screen.getByRole("heading", { name: /new message/i })).toBeInTheDocument();
  });

  it("creates a conversation in NewMessageDialog and navigates to it", async () => {
    render(<NewMessageDialog isOpen onClose={vi.fn()} />);

    await userEvent.type(screen.getByRole("textbox"), "na");
    await userEvent.click(screen.getByRole("button", { name: /nada/i }));
    await userEvent.click(screen.getByRole("button", { name: /open conversation/i }));

    await waitFor(() => {
      expect(mockCreateConversation).toHaveBeenCalledWith("u1");
    });
    expect(mockNavigate).toHaveBeenCalledWith("/messages/conversation-1");
  });

  it("renders MessagesPage with a selected conversation", () => {
    const store = configureStore({
      reducer: {
        audioSource: audioSourceReducer,
        user: userReducer,
        queue: queueReducer,
        playContext: playContextReducer,
      },
      preloadedState: {
        user: {
          currentUser: {
            id: "me-1",
            username: "nada",
            email: "nada@example.com",
            role: "listener",
            isVerified: true,
            avatarUrl: null,
          },
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/messages/c1"]}>
          <Routes>
            <Route path="/messages/:conversationId" element={<MessagesPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByTestId("chat-window")).toHaveTextContent("c1");
  });
});
