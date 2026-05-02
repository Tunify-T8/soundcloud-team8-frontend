import { useState } from "react";
import { Lock, X } from "lucide-react";
import type { Track } from "@/shared/types/Track";
import { trackService } from "../trackService";

export default function TrackDeleteConfirmModal({
  track,
  onCancel,
  onDeleted,
}: {
  track: Track;
  onCancel: () => void;
  onDeleted: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await trackService.deleteTrack(track.id);
      onDeleted(track.id);
    } catch (e) {
      console.error("Failed to delete track:", e);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4">
        <div
          data-testid="delete-confirm-modal"
          className="bg-[#111] border border-zinc-800 rounded-xl w-full max-w-[540px] p-6 sm:p-8 pointer-events-auto shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-lg sm:text-xl font-bold">
              Permanently delete this track?
            </h2>
            <button
              data-testid="delete-modal-close-btn"
              onClick={onCancel}
              className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-zinc-700 rounded flex items-center justify-center overflow-hidden">
              {track.thumbnailUrl ? (
                <img
                  src={track.thumbnailUrl}
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
                  <polygon points="2,0 14,7 2,14" />
                </svg>
              )}
              {track.isPrivate && (
                <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-0.5">
                  <Lock className="w-3 h-3 text-zinc-400" />
                </div>
              )}
            </div>
            <span className="text-white font-semibold text-sm sm:text-base truncate">
              {track.title}
            </span>
          </div>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            Removing this track is irreversible. You will lose all the plays,
            likes, and comments for this track with no way to get them back.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              data-testid="delete-modal-cancel-btn"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              data-testid="delete-modal-confirm-btn"
              onClick={handleDelete}
              disabled={loading}
              className="px-5 py-2.5 rounded-full bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              {loading ? "Deleting..." : "Delete forever"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
