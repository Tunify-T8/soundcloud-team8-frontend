import { useState } from "react";
import type { AttachmentOption } from "../hooks/useAttachmentPicker";
import { useAttachmentPicker } from "../hooks/useAttachmentPicker";

type Tab = "uploaded" | "liked" | "playlists";

interface AttachmentPickerProps {
  onSelect: (option: AttachmentOption) => void;
  onClose: () => void;
}

export default function AttachmentPicker({ onSelect, onClose }: AttachmentPickerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("uploaded");
  const { uploadedTracks, likedTracks, collections, isLoading, error } =
    useAttachmentPicker(true);

  const items =
    activeTab === "uploaded"
      ? uploadedTracks
      : activeTab === "liked"
      ? likedTracks
      : collections;

  return (
    <div className="border-t border-zinc-700 bg-zinc-900 px-4 py-3 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {(["uploaded", "liked", "playlists"] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition ${
              activeTab === tab
                ? "bg-white text-black"
                : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
            }`}
          >
            {tab === "uploaded"
              ? "My Tracks"
              : tab === "liked"
              ? "Liked"
              : "Playlists"}
          </button>
        ))}
        <button
          type="button"
          onClick={onClose}
          className="ml-auto text-xs text-zinc-500 hover:text-zinc-200"
        >
          Cancel
        </button>
      </div>

      <div className="max-h-48 overflow-y-auto flex flex-col gap-1">
        {isLoading && <p className="text-xs text-zinc-400 py-2">Loading...</p>}
        {error && <p className="text-xs text-red-400 py-2">{error}</p>}
        {!isLoading && !error && items.length === 0 && (
          <p className="text-xs text-zinc-500 py-2">Nothing here yet.</p>
        )}
        {!isLoading &&
          !error &&
          items.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              onClick={() => onSelect(item)}
              className="flex items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-zinc-800 transition"
            >
              {item.coverUrl ? (
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="h-9 w-9 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-zinc-700">
                  <span className="text-xs text-zinc-400">
                    {item.type === "PLAYLIST" || item.type === "ALBUM"
                      ? "📂"
                      : "🎵"}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm text-zinc-100">{item.title}</p>
                <p className="text-xs text-zinc-500 capitalize">
                  {item.type === "TRACK_UPLOAD"
                    ? "Your track"
                    : item.type === "TRACK_LIKE"
                    ? "Liked track"
                    : item.type.toLowerCase()}
                </p>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}