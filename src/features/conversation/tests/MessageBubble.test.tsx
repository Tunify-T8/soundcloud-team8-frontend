import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MessageBubble from "../components/MessageBubble";
import type { Message } from "../types";

vi.mock("../../../hooks/Useplayback", () => ({
  usePlayback: () => ({
    status: "paused",
    bundle: null,
    currentTime: 0,
    duration: 100,
    buffered: 0,
    previewSecondsRemaining: null,
    play: vi.fn(() => Promise.resolve()),
    pause: vi.fn(),
    seek: vi.fn(),
    audioRef: { current: null },
    error: null,
    volume: 1,
    isMuted: false,
    setVolume: vi.fn(),
    toggleMute: vi.fn(),
  }),
}));

const mockMessage: Message = {
  id: "1",
  conversationId: "conv1",
  senderId: "user1",
  sender: {
    id: "user1",
    displayName: "User One",
    avatarUrl: null,
  },
  type: "TEXT",
  content: "Hello world",
  read: true,
  createdAt: new Date().toISOString(),
};

describe("MessageBubble", () => {
  it("renders text message", () => {
    render(<MessageBubble message={mockMessage} isMe={true} />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders sender name when not me", () => {
    render(<MessageBubble message={mockMessage} isMe={false} />);
    expect(screen.getByText("User One")).toBeInTheDocument();
  });

  it("handles audio message interaction", () => {
    const audioMessage: Message = {
      ...mockMessage,
      type: "TRACK_UPLOAD",
      attachment: {
        id: "a1",
        type: "TRACK_UPLOAD",
        preview: {},
      },
    };

    render(<MessageBubble message={audioMessage} isMe={true} />);

    const button = screen.queryByRole("button");
    if (button) fireEvent.click(button);
  });
});