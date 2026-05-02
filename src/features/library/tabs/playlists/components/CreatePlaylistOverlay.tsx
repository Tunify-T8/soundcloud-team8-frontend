import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { playlistService } from "../../../libraryService";
import type { CollectionPreview, TrackItem } from "../../../types";

interface CreatePlaylistOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  track: TrackItem;
  defaultCoverUrl?: string;
  autoAddTrackId?: string;
}

export default function CreatePlaylistOverlay({
  isOpen,
  onClose,
  track,
  defaultCoverUrl,
  autoAddTrackId,
}: CreatePlaylistOverlayProps) {
  const [existingPlaylists, setExistingPlaylists] = useState<
    CollectionPreview[]
  >([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const hasPlaylists = existingPlaylists.length > 0;

  const [activeTab, setActiveTab] = useState<"add" | "create">("create");
  const [filterQuery, setFilterQuery] = useState("");
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [titleTouched, setTitleTouched] = useState(false);
  const [addingToPlaylistId, setAddingToPlaylistId] = useState<string | null>(
    null,
  );
  const [addToPlaylistSuccess, setAddToPlaylistSuccess] = useState<
    string | null
  >(null);
  const [addToPlaylistError, setAddToPlaylistError] = useState<string | null>(
    null,
  );

  const isTitleValid = playlistTitle.trim().length > 0;
  const canSave = useMemo(
    () => isTitleValid && !creating,
    [isTitleValid, creating],
  );

  const filteredPlaylists = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return existingPlaylists;
    return existingPlaylists.filter((p) => p.title.toLowerCase().includes(q));
  }, [filterQuery, existingPlaylists]);

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!track?.id) return;
    setAddingToPlaylistId(playlistId);
    setAddToPlaylistSuccess(null);
    setAddToPlaylistError(null);
    const ok = await playlistService.addTrack(playlistId, {
      trackId: track.id,
    });
    setAddingToPlaylistId(null);
    if (ok) {
      setAddToPlaylistSuccess(playlistId);
    } else {
      setAddToPlaylistError(playlistId);
    }
  };

  const handleCreatePlaylist = async () => {
    setTitleTouched(true);
    if (!isTitleValid) {
      setError("Playlist title is required.");
      return;
    }
    setCreating(true);
    setError(null);
    setSuccess(null);

    // Use defaultCoverUrl as the playlist avatar if provided, otherwise fallback to track.coverUrl
    // let coverUrl: File | undefined = undefined;
    // const coverSource = defaultCoverUrl || track.coverUrl;
    // if (coverSource) {
    //   try {
    //     const response = await fetch(coverSource);
    //     const blob = await response.blob();
    //     coverUrl = new File([blob], "cover.jpg", { type: blob.type });
    //   } catch {}
    // }

    const payload = {
      title: playlistTitle,
      type: "PLAYLIST" as const,
      privacy,
      description: undefined,
      coverUrl: defaultCoverUrl,
    };
    const res = await playlistService.createCollection(payload);
    setCreating(false);
    if (res) {
      setSuccess("Playlist created!");
      setPlaylistTitle("");
      setTitleTouched(false);
      // Auto-add track if requested
      if (autoAddTrackId) {
        await playlistService.addTrack(res.id, { trackId: autoAddTrackId });
      }
      // Optionally refresh playlists here
    } else {
      setError("Failed to create playlist.");
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setLoadingPlaylists(true);

    void (async () => {
      const res = await playlistService.getMyCollections(1, 20, "PLAYLIST");
      if (!mounted) return;

      const playlists = res?.data ?? [];
      const ownedPlaylists = playlists.filter((playlist) => !playlist.isLiked);
      setExistingPlaylists(ownedPlaylists);
      setActiveTab(ownedPlaylists.length > 0 ? "add" : "create");
      setLoadingPlaylists(false);
    })();

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-70 bg-white/40"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="fixed right-6 top-6 z-72 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
        aria-label="Close create playlist overlay"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        className="fixed inset-0 z-71 overflow-y-auto hide-scrollbar"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <div className="flex min-h-full items-start justify-center px-0 py-0 sm:px-4 sm:py-24">
          <div
            className="w-full max-w-2xl rounded-none border-0 bg-[#0b0b0b] p-4 text-white shadow-2xl sm:rounded-sm sm:border sm:border-zinc-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-6 text-[20px] font-bold">
              {hasPlaylists && (
                <button
                  onClick={() => setActiveTab("add")}
                  className={`pb-2 transition-colors ${activeTab === "add" ? "border-b border-white text-white" : "text-zinc-500"}`}
                >
                  Add to playlist
                </button>
              )}
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
                  className="w-full rounded-sm border border-zinc-800 bg-[#2f2f2f] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-400 focus:border-zinc-600"
                />

                <div className="mt-4 space-y-2">
                  {loadingPlaylists && (
                    <p className="py-3 text-sm text-zinc-400">
                      Loading playlists...
                    </p>
                  )}

                  {!loadingPlaylists &&
                    filteredPlaylists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className="flex items-center justify-between rounded-sm bg-[#0b0b0b] px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-zinc-800">
                            {playlist.coverUrl ? (
                              <img
                                src={playlist.coverUrl}
                                alt={playlist.title}
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-white">
                              {playlist.title}
                            </p>
                            <p className="truncate text-xs text-zinc-400">
                              {playlist.trackCount} tracks
                            </p>
                          </div>
                        </div>
                        <button
                          className="rounded-sm bg-zinc-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-zinc-600 disabled:opacity-60"
                          disabled={addingToPlaylistId === playlist.id}
                          onClick={() => handleAddToPlaylist(playlist.id)}
                        >
                          {addingToPlaylistId === playlist.id
                            ? "Adding..."
                            : addToPlaylistSuccess === playlist.id
                              ? "Added"
                              : addToPlaylistError === playlist.id
                                ? "Failed"
                                : "Add"}
                        </button>
                      </div>
                    ))}

                  {!loadingPlaylists && filteredPlaylists.length === 0 && (
                    <p className="py-3 text-sm text-zinc-400">
                      No playlists found.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <label className="text-[14px] font-semibold text-zinc-200">
                    Playlist title<span className="text-red-500"> *</span>
                  </label>
                  <input
                    value={playlistTitle}
                    onChange={(e) => setPlaylistTitle(e.target.value)}
                    onBlur={() => setTitleTouched(true)}
                    className={`mt-2 w-full rounded-sm border ${!isTitleValid && titleTouched ? "border-red-500" : "border-zinc-800"} bg-[#2f2f2f] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-400 focus:border-zinc-600`}
                    required
                    aria-invalid={!isTitleValid && titleTouched}
                    aria-describedby="playlist-title-error"
                  />
                  {!isTitleValid && titleTouched && (
                    <div
                      id="playlist-title-error"
                      className="mt-2 text-red-400 text-xs"
                    >
                      Playlist title is required.
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-4 text-[14px]">
                    <span className="font-semibold text-zinc-200">
                      Privacy:
                    </span>
                    <label className="flex cursor-pointer items-center gap-2 text-white">
                      <input
                        type="radio"
                        checked={privacy === "public"}
                        onChange={() => setPrivacy("public")}
                        className="h-4 w-4 accent-white"
                      />
                      <span className="font-semibold">Public</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-white">
                      <input
                        type="radio"
                        checked={privacy === "private"}
                        onChange={() => setPrivacy("private")}
                        className="h-4 w-4 accent-white"
                      />
                      <span className="font-semibold">Private</span>
                    </label>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <button
                      type="button"
                      disabled={!canSave}
                      className="min-h-[40px] rounded-sm bg-white px-5 py-2 text-[13px] font-bold text-black disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-0"
                      onClick={handleCreatePlaylist}
                    >
                      {creating ? "Saving..." : "Save"}
                    </button>
                    {error && (
                      <div className="text-red-400 text-xs">{error}</div>
                    )}
                    {success && (
                      <div className="text-green-400 text-xs">{success}</div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-zinc-800">
                      {track.coverUrl ? (
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold text-zinc-400">
                        {track.artist}
                      </p>
                      <p className="truncate text-[13px] font-bold text-white">
                        {track.title}
                      </p>
                    </div>
                  </div>
                  <button
                    className="text-zinc-500 transition-colors hover:text-zinc-300"
                    aria-label="Remove track"
                  >
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
