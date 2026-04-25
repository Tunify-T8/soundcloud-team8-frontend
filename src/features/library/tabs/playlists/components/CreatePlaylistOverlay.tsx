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
      setExistingPlaylists(playlists);
      setActiveTab(playlists.length > 0 ? "add" : "create");
      setLoadingPlaylists(false);
    })();

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <button
        onClick={onClose}
        className="fixed right-6 top-6 z-72 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
        aria-label="Close create playlist overlay"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="fixed inset-0 z-71 overflow-y-auto hide-scrollbar">
        <div className="flex min-h-full items-start justify-center px-4 py-24">
          <div
            className="w-full max-w-3xl rounded-lg border border-zinc-700 bg-gradient-to-br from-[#18181b] to-[#232326] p-8 text-white shadow-2xl flex flex-col md:flex-row gap-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main Form */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold mb-4">Create a playlist</h2>
              <label className="block text-zinc-300 mb-1 font-semibold">
                Playlist title<span className="text-red-500">*</span>
              </label>
              <input
                value={playlistTitle}
                onChange={(e) => setPlaylistTitle(e.target.value)}
                onBlur={() => setTitleTouched(true)}
                className={`w-full rounded bg-zinc-800 border ${!isTitleValid && titleTouched ? "border-red-500" : "border-zinc-700"} px-3 py-2 text-white mb-2 focus:border-orange-400`}
                placeholder="Give your playlist a name"
                required
              />
              {/* Tag Input (UI only) */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-zinc-700 px-3 py-1 rounded-full text-xs">#World</span>
                  <span className="bg-zinc-700 px-3 py-1 rounded-full text-xs">#Bhangra</span>
                </div>
                <input
                  className="mt-2 w-full rounded bg-zinc-800 border border-zinc-700 px-3 py-2 text-white"
                  placeholder="Add tags (e.g. #pop, #chill)"
                  disabled
                />
                <p className="text-xs text-zinc-400 mt-1">Add tags to help people find your playlist.</p>
              </div>
              {/* Privacy & Save */}
              <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2">
                  <input type="radio" checked={privacy === "public"} onChange={() => setPrivacy("public")} className="accent-orange-500" />
                  <span>Public</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={privacy === "private"} onChange={() => setPrivacy("private")} className="accent-orange-500" />
                  <span>Private</span>
                </label>
                <button
                  type="button"
                  disabled={!canSave}
                  className="ml-auto rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600 disabled:opacity-60"
                  onClick={handleCreatePlaylist}
                >
                  {creating ? "Saving..." : "Save"}
                </button>
              </div>
              {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
              {success && <div className="text-green-400 text-sm mb-2">{success}</div>}
            </div>
            {/* Cover Image Upload */}
            <div className="w-56 flex flex-col items-center">
              <div className="relative w-48 h-48 rounded bg-zinc-900 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden mb-2">
                {defaultCoverUrl ? (
                  <img src={defaultCoverUrl} alt="Cover" className="object-cover w-full h-full" />
                ) : (
                  <span className="text-zinc-600">No Cover</span>
                )}
                <button className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-zinc-800 text-white px-3 py-1 rounded hover:bg-zinc-700 text-xs">
                  Upload Image
                </button>
              </div>
              <span className="text-xs text-zinc-400">Max size: 5MB</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
