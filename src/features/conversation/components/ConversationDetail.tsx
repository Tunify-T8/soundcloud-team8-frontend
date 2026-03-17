import { useConversationMessages } from "../hooks/useConversationMessages";
import type { ConversationSummary } from "../types";

interface ConversationDetailProps {
	conversation: ConversationSummary | null;
	className?: string;
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
							<div
								key={message.id}
								className={`flex gap-2 ${
									message.senderId === conversation.otherUser.id ? "justify-start" : "justify-end"
								}`}
							>
								<div
									className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
										message.senderId === conversation.otherUser.id
											? "bg-zinc-800 text-zinc-100"
											: "bg-blue-600 text-white"
									}`}
								>
									<p>{message.text || "[Attachment]"}</p>
									<p className="mt-1 text-xs opacity-70">
										{new Date(message.createdAt).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</p>
								</div>
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
