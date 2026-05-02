import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useFollowingSuggestions } from "../hooks/useFollowingSuggestions";
import { conversationService } from "../conversationService";
import type { User } from "../types";
import { useBlockedUserIds } from "../hooks/useBlockedUserIds";


type NewMessageDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated?: (conversationId: string) => void;
};

export default function NewMessageDialog({
  isOpen,
  onClose,
  onConversationCreated,
}: NewMessageDialogProps) {
  const navigate = useNavigate();
  const [toQuery, setToQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { suggestions, isLoading: suggestionsLoading } =
    useFollowingSuggestions(selectedUser ? "" : toQuery);

  const blockedIds = useBlockedUserIds();
  const filteredSuggestions = suggestions.filter((u) => !blockedIds.has(u.id));

  function handleSelect(user: User) {
    setSelectedUser(user);
    setToQuery("");
  }

  async function handleStart() {
    if (!selectedUser) {
      setSubmitError("Please select a recipient");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const conversationId = await conversationService.createOrGetConversation(
        selectedUser.id,
      );

      onConversationCreated?.(conversationId);
      navigate(`/messages/${conversationId}`);
      handleDialogClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to open conversation";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDialogClose() {
    setToQuery("");
    setSelectedUser(null);
    setSubmitError(null);
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-white/35 backdrop-blur-[2px] p-4 pt-14"
          onClick={handleDialogClose}
        >
          <motion.div
            className="min-h-[220px] w-full max-w-2xl rounded-md bg-zinc-900 p-3 text-white"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <h2 className="text-xl font-bold tracking-tight">New message</h2>

            {/* Recipient picker */}
            <div className="relative mt-3">
              <label className="block text-base font-semibold text-zinc-100">
                To <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 flex min-h-[34px] flex-wrap items-center gap-2 rounded-md border border-zinc-500 bg-zinc-700 px-3 py-1.5">
                {selectedUser && (
                  <span className="flex items-center gap-1 rounded bg-zinc-500 px-2 py-0.5 text-sm text-zinc-100">
                    {selectedUser.displayName}
                    <button
                      type="button"
                      className="ml-1 leading-none text-zinc-300 hover:text-white"
                      onClick={() => setSelectedUser(null)}
                    >
                      ×
                    </button>
                  </span>
                )}
                {!selectedUser && (
                  <input
                    type="text"
                    value={toQuery}
                    onChange={(e) => setToQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-400"
                    placeholder="Search your followings…"
                    autoComplete="off"
                    disabled={isSubmitting}
                  />
                )}
              </div>

              {!selectedUser && suggestionsLoading && toQuery.trim().length > 1 && (
                <p className="mt-1 text-xs text-zinc-400">Searching…</p>
              )}

              {!selectedUser && filteredSuggestions.length > 0 && (
                <ul className="absolute left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-md border border-zinc-600 bg-zinc-800 shadow-lg">
                  {filteredSuggestions.map((user) => (
                    <li key={user.id}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-zinc-100 hover:bg-zinc-700"
                        onClick={() => handleSelect(user)}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-500 text-xs font-semibold uppercase overflow-hidden">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.displayName}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            user.displayName.charAt(0)
                          )}
                        </span>
                        {user.displayName}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="mt-3 text-sm text-zinc-400">
              A conversation will be created and you can type your first message there.
            </p>

            {submitError && (
              <p className="mt-2 text-sm text-red-400">{submitError}</p>
            )}

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleDialogClose}
                className="rounded-md px-3.5 py-1.5 text-sm font-semibold text-zinc-400 hover:text-zinc-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStart}
                disabled={isSubmitting || !selectedUser}
                className="rounded-md bg-zinc-100 px-3.5 py-1.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
              >
                {isSubmitting ? "Opening…" : "Open conversation"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
