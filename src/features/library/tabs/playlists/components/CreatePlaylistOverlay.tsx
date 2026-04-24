import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

interface CreatePlaylistOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  track: {
    title: string;
    artist: string;
    coverUrl?: string;
  };
}

export default function CreatePlaylistOverlay({ isOpen, onClose, track }: CreatePlaylistOverlayProps) {
  const [activeTab, setActiveTab] = useState<"add" | "create">("add");
  const [filterQuery, setFilterQuery] = useState("");
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");

  const canSave = useMemo(() => playlistTitle.trim().length > 0, [playlistTitle]);
  const existingPlaylists = [
    { id: "pl-1", title: "Night Drive", trackCount: 14 },
    { id: "pl-2", title: "Arabic Classics", trackCount: 28 },
    { id: "pl-3", title: "Focus Mix", trackCount: 9 },
  ];

  const filteredPlaylists = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return existingPlaylists;
    return existingPlaylists.filter((p) => p.title.toLowerCase().includes(q));
  }, [filterQuery]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-white/40" onClick={onClose} />
      <button
        onClick={onClose}
        className="fixed right-6 top-6 z-[72] flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
        aria-label="Close create playlist overlay"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="fixed inset-0 z-[71] overflow-y-auto hide-scrollbar">
        <div className="flex min-h-full items-start justify-center px-4 py-24">
          <div
            className="w-full max-w-[520px] rounded-sm border border-zinc-700 bg-[#0b0b0b] p-4 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-6 text-[20px] font-bold">
              <button
                onClick={() => setActiveTab("add")}
                className={`pb-2 transition-colors ${activeTab === "add" ? "border-b border-white text-white" : "text-zinc-500"}`}
              >
                Add to playlist
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className={`pb-2 transition-colors ${activeTab === "create" ? "border-b border-white text-white" : "text-zinc-500"}`}
              >
                Create a playlist
              </button>
            </div>

            {activeTab === "add" ? (
              <div className="mt-4">
                <input
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter playlists"
                  className="w-full rounded-sm border border-zinc-700 bg-[#272727] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                />

                <div className="mt-4 space-y-2">
                  {filteredPlaylists.map((playlist) => (
                    <div key={playlist.id} className="flex items-center justify-between rounded-sm bg-[#0b0b0b] px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">{playlist.title}</p>
                        <p className="truncate text-xs text-zinc-400">{playlist.trackCount} tracks</p>
                      </div>
                      <button className="rounded-sm bg-zinc-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-700">
                        Add to Playlist
                      </button>
                    </div>
                  ))}

                  {filteredPlaylists.length === 0 && (
                    <p className="py-3 text-sm text-zinc-400">No playlists found.</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <label className="text-[15px] font-semibold text-zinc-200">
                    Playlist title<span className="text-red-500"> *</span>
                  </label>
                  <input
                    value={playlistTitle}
                    onChange={(e) => setPlaylistTitle(e.target.value)}
                    className="mt-1 w-full rounded-sm border border-zinc-600 bg-[#272727] px-3 py-2 text-sm text-white outline-none focus:border-zinc-400"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-[15px]">
                    <span className="font-semibold text-zinc-200">Privacy:</span>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        checked={privacy === "public"}
                        onChange={() => setPrivacy("public")}
                        className="h-4 w-4 accent-white"
                      />
                      <span className="font-semibold">Public</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        checked={privacy === "private"}
                        onChange={() => setPrivacy("private")}
                        className="h-4 w-4 accent-white"
                      />
                      <span className="font-semibold">Private</span>
                    </label>
                  </div>

                  <button
                    disabled={!canSave}
                    className="rounded-sm bg-white px-2 py-1 text-[13px] font-bold text-black disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Save
                  </button>
                </div>

                <div className="mt-6 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-sm bg-zinc-700">
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt={track.title} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold text-zinc-300">{track.artist}</p>
                      <p className="truncate text-[13px] font-bold">{track.title}</p>
                    </div>
                  </div>
                  <button className="text-zinc-500 transition-colors hover:text-zinc-300" aria-label="Remove track">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
