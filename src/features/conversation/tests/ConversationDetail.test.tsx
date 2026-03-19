import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ConversationDetail from "../components/ConversationDetail";
import type { ConversationSummary, Message } from "../types";
import { useConversationMessages } from "../hooks/useConversationMessages";

vi.mock("../hooks/useConversationMessages", () => ({
	useConversationMessages: vi.fn(),
}));

const mockedUseConversationMessages = vi.mocked(useConversationMessages);

const baseConversation: ConversationSummary = {
	conversationId: "conv-1",
	otherUser: {
		id: "user-1",
		displayName: "Omar Tamer",
		avatarUrl: "",
	},
	lastMessagePreview: "Last preview",
	lastMessageAt: "2026-03-14T18:00:00.000Z",
	unreadCount: 1,
};

function makeMessage(overrides: Partial<Message>): Message {
	return {
		id: "msg-1",
		conversationId: "conv-1",
		senderId: "user-1",
		sender: {
			id: "user-1",
			displayName: "Omar Tamer",
			avatarUrl: "",
		},
		receiverId: "current-user-uuid",
		type: "TEXT",
		text: "Hello",
		createdAt: "2026-03-14T18:00:00.000Z",
		status: "READ",
		...overrides,
	};
}

describe("ConversationDetail", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-03-18T18:00:00.000Z"));
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	it("renders empty state when no conversation is selected", () => {
		mockedUseConversationMessages.mockReturnValue({
			messages: [],
			isLoading: false,
			error: null,
		});

		render(<ConversationDetail conversation={null} />);

		expect(screen.getByText("Select a conversation to start messaging")).toBeInTheDocument();
	});

	it("renders loading state", () => {
		mockedUseConversationMessages.mockReturnValue({
			messages: [],
			isLoading: true,
			error: null,
		});

		render(<ConversationDetail conversation={baseConversation} />);

		expect(screen.getByText("Loading messages...")).toBeInTheDocument();
	});

	it("renders message rows with sender names and relative time", () => {
		mockedUseConversationMessages.mockReturnValue({
			messages: [
				makeMessage({
					id: "msg-other",
					senderId: "user-1",
					sender: { id: "user-1", displayName: "Omar Tamer", avatarUrl: "" },
					text: "vmsp",
					createdAt: "2026-03-14T18:00:00.000Z",
				}),
				makeMessage({
					id: "msg-me",
					senderId: "current-user-uuid",
					sender: { id: "current-user-uuid", displayName: "You", avatarUrl: "" },
					receiverId: "user-1",
					text: "Imalmg",
					createdAt: "2026-03-14T17:30:00.000Z",
				}),
			],
			isLoading: false,
			error: null,
		});

		render(<ConversationDetail conversation={baseConversation} />);

		expect(screen.getByRole("heading", { name: "Omar Tamer" })).toBeInTheDocument();
		expect(screen.getByText("Me")).toBeInTheDocument();
		expect(screen.getByText("vmsp")).toBeInTheDocument();
		expect(screen.getByText("Imalmg")).toBeInTheDocument();
		expect(screen.getAllByText("4 days ago")).toHaveLength(2);
		expect(screen.getByText("Add track or playlist")).toBeInTheDocument();
		expect(screen.getByText("Send")).toBeInTheDocument();
	});
});
