import { useState, useEffect } from "react";
import type { Message } from "../types";
import { conversationService } from "../conversationService";
import { getMockMessagesByConversationId } from "../mockMessages";

export function useConversationMessages(conversationId: string | null) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!conversationId) {
			setMessages([]);
			return;
		}

		const convoId = conversationId;
		let isMounted = true;

		async function fetchMessages() {
			setIsLoading(true);
			setError(null);
			try {
				const fetchedMessages = await conversationService.getMessages(convoId);
				if (isMounted) {
					setMessages(fetchedMessages);
				}
			} catch (err) {
				if (isMounted) {
					setMessages(getMockMessagesByConversationId(convoId));
					setError(null);
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
