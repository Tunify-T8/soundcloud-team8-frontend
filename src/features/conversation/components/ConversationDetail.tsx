import { useConversationMessages } from "../hooks/useConversationMessages";
import type { ConversationSummary } from "../types";

interface ConversationDetailProps {
	conversation: ConversationSummary | null;
	className?: string;
}

function getDisplaySenderName(senderId: string, otherUserId: string, senderName?: string): string {
	if (senderId === otherUserId) {
		return senderName || "User";
	}

	return "Me";
}

function formatRelativeTime(dateIso: string): string {
	const timestamp = new Date(dateIso).getTime();
	if (Number.isNaN(timestamp)) {
		return "";
	}

	const elapsedMs = Date.now() - timestamp;
	const elapsedMinutes = Math.max(1, Math.floor(elapsedMs / 60000));

	if (elapsedMinutes < 60) {
		return `${elapsedMinutes} minute${elapsedMinutes > 1 ? "s" : ""} ago`;
	}

	const elapsedHours = Math.floor(elapsedMinutes / 60);
	if (elapsedHours < 24) {
		return `${elapsedHours} hour${elapsedHours > 1 ? "s" : ""} ago`;
	}

	const elapsedDays = Math.floor(elapsedHours / 24);
	return `${elapsedDays} day${elapsedDays > 1 ? "s" : ""} ago`;
}

export default function ConversationDetail({ conversation, className = "" }: ConversationDetailProps) {
	const { messages, isLoading, error } = useConversationMessages(
		conversation?.conversationId || null,
	);

	if (!conversation) {
		return (
			<div className={`flex flex-1 flex-col items-center justify-center rounded-md border border-zinc-800 bg-zinc-950 text-center ${className}`}>
				<p className="text-sm text-zinc-400">Select a conversation to start messaging</p>
			</div>
		);
	}

	return (
		<div className={`flex flex-1 flex-col rounded-md border border-zinc-800 bg-zinc-950 ${className}`}>
			{/* Header */}
			<div className="border-b border-zinc-800 px-4 py-3">
				<h2 className="text-base font-semibold text-white">{conversation.otherUser.displayName}</h2>
			</div>

			{/* Messages List */}
			<div className="flex-1 overflow-y-auto px-4 py-4">
				{isLoading && <p className="text-sm text-zinc-400">Loading messages...</p>}

				{error && <p className="text-sm text-red-400">{error}</p>}

				{!isLoading && !error && messages.length === 0 && (
					<p className="text-center text-sm text-zinc-400">No messages yet</p>
				)}

				<div className="space-y-3">
					{!isLoading &&
						!error &&
						messages.map((message) => (
							<div key={message.id} className="flex items-start justify-between gap-4 py-1">
								<div className="flex min-w-0 items-start gap-3">
									{message.sender.avatarUrl ? (
										<img
											src={message.sender.avatarUrl}
											alt={message.sender.displayName}
											className="h-11 w-11 shrink-0 rounded-full object-cover"
										/>
									) : (
										<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-500 text-xs font-semibold text-zinc-100">
											{getDisplaySenderName(
												message.senderId,
												conversation.otherUser.id,
												message.sender.displayName,
											)
												.charAt(0)
												.toUpperCase()}
										</div>
									)}

									<div className="min-w-0 text-sm text-zinc-200">
										<p className="font-semibold text-white">
											{getDisplaySenderName(
												message.senderId,
												conversation.otherUser.id,
												message.sender.displayName,
											)}
										</p>
										<p className="break-words text-zinc-300">{message.text || "[Attachment]"}</p>
									</div>
								</div>

								<p className="shrink-0 pt-1 text-xs text-zinc-500">
									{formatRelativeTime(message.createdAt)}
								</p>
							</div>
						))}
				</div>
			</div>

			{/* Input Area */}
			<div className="border-t border-zinc-800 px-4 py-3">
				<textarea
					placeholder="Write your message..."
					className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
					rows={2}
				/>
				<div className="mt-2 flex items-center justify-between gap-2">
					<button className="rounded-md bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-600">
						Add track or playlist
					</button>
					<button className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-300">
						Send
					</button>
				</div>
			</div>
		</div>
	);
}
