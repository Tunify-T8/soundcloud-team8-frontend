import { useState, useEffect } from "react";
import type { Message } from "../types";
import { conversationService } from "../conversationService";

export function useConversationMessages(conversationId: string | null) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!conversationId) {
			setMessages([]);
			return;
		}

		let isMounted = true;

		async function fetchMessages() {
			setIsLoading(true);
			setError(null);
			try {
				const fetchedMessages = await conversationService.getMessages(conversationId);
				if (isMounted) {
					setMessages(fetchedMessages);
				}
			} catch (err) {
				if (isMounted) {
					const errorMessage = err instanceof Error ? err.message : "Failed to load messages";
					setError(errorMessage);
					setMessages([]);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		fetchMessages();

		return () => {
			isMounted = false;
		};
	}, [conversationId]);

	return { messages, isLoading, error };
}
