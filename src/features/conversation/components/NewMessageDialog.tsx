import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFollowingSuggestions } from "../hooks/useFollowingSuggestions";
import type { FollowingUser } from "../types";

type NewMessageDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function NewMessageDialog({ isOpen, onClose }: NewMessageDialogProps) {
  const [toQuery, setToQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<FollowingUser | null>(null);
  const { suggestions, isLoading } = useFollowingSuggestions(selectedUser ? "" : toQuery);

  function handleSelect(user: FollowingUser) {
    setSelectedUser(user);
    setToQuery("");
  }

  function handleClose() {
    setToQuery("");
    setSelectedUser(null);
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-white/35 backdrop-blur-[2px] p-4 pt-14"
          onClick={handleClose}
        >
          <motion.div
            className="min-h-[340px] w-full max-w-2xl rounded-md bg-zinc-900 p-3 text-white"
            onClick={(event) => event.stopPropagation()}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <h2 className="text-xl font-bold tracking-tight">New message</h2>

            <div className="relative mt-3">
              <label className="block text-base font-semibold text-zinc-100">
                To <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 flex min-h-[34px] flex-wrap items-center gap-2 rounded-md border border-zinc-500 bg-zinc-700 px-3 py-1.5">
                {selectedUser && (
                  <span className="flex items-center gap-1 rounded bg-zinc-500 px-2 py-0.5 text-sm text-zinc-100">
                    {selectedUser.username}
                    <button
                      type="button"
                      className="ml-1 leading-none text-zinc-300 hover:text-white"
                      onClick={() => setSelectedUser(null)}
                    >
                      
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
                  />
                )}
              </div>

              {!selectedUser && isLoading && toQuery.trim().length > 0 && (
                <p className="mt-1 text-xs text-zinc-400">Searching…</p>
              )}

              {!selectedUser && suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-md border border-zinc-600 bg-zinc-800 shadow-lg">
                  {suggestions.map((user) => (
                    <li key={user.id}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-zinc-100 hover:bg-zinc-700"
                        onClick={() => handleSelect(user)}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-500 text-xs font-semibold uppercase">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.username}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            user.username.charAt(0)
                          )}
                        </span>
                        {user.username}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-base font-semibold text-zinc-100">
                Write your message and add tracks or playlists <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                className="mt-2 w-full rounded-md border border-zinc-500 bg-zinc-700 px-3 py-1.5 text-sm text-zinc-100 outline-none"
              />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                className="rounded-md bg-zinc-700 px-3.5 py-1.5 text-sm font-semibold text-zinc-100 hover:bg-zinc-600"
              >
                Add track or playlist
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="rounded-md bg-zinc-100 px-3.5 py-1.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-200"
              >
                Send
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}