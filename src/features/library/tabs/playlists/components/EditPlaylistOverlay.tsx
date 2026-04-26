import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { playlistService } from "../../../libraryService";
import type { Collection, CollectionTrack } from "../../../types";

interface EditPlaylistOverlayProps {
  isOpen: boolean;
  playlist: Collection;
  tracks?: CollectionTrack[];
  onClose: () => void;
  onSaved?: () => void;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const fieldClass =
  "h-9 w-full rounded-sm bg-zinc-800 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:ring-1 focus:ring-zinc-500";

const labelClass = "mb-1.5 text-xs font-bold text-white";

type EditTab = "basic" | "tracks" | "metadata";

function formatTrackDuration(totalSeconds?: number) {
  if (!totalSeconds || totalSeconds < 0) return "0:00";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0)
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

const EditPlaylistOverlay: React.FC<EditPlaylistOverlayProps> = ({
  isOpen,
  playlist,
  tracks = [],
  onClose,
  onSaved,
}) => {
  const [activeTab, setActiveTab] = useState<EditTab>("basic");
  const [localTracks, setLocalTracks] = useState<CollectionTrack[]>(tracks);
  const [removingTrackIds, setRemovingTrackIds] = useState<Set<string>>(
    new Set(),
  );
  const [title, setTitle] = useState(playlist.title);
  const [description, setDescription] = useState(playlist.description ?? "");
  const [privacy, setPrivacy] = useState<"public" | "private">(
    playlist.privacy,
  );
  const [coverChanged, setCoverChanged] = useState(false);
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab("basic");
    setLocalTracks(tracks);
    setRemovingTrackIds(new Set());
    setTitle(playlist.title);
    setDescription(playlist.description ?? "");
    setPrivacy(playlist.privacy);
    setCoverChanged(false);
    setUploadedCoverUrl(null);
    setIsUploadingCover(false);
    setPreviewUrl(null);
    setError(null);
  }, [isOpen, playlist, tracks]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const permalink = useMemo(
    () =>
      `soundcloud.com/${playlist.owner.username}/sets/${slugify(title) || slugify(playlist.title)}`,
    [playlist.owner.username, playlist.title, title],
  );

  const normalizedTitle = title.trim();
  const normalizedDescription = description ?? "";
  const hasChanges =
    normalizedTitle !== playlist.title ||
    normalizedDescription !== (playlist.description ?? "") ||
    privacy !== playlist.privacy ||
    coverChanged;
  const canSave =
    hasChanges &&
    !saving &&
    !isUploadingCover &&
    (!coverChanged || !!uploadedCoverUrl);

  const imageSrc = previewUrl ?? playlist.coverUrl ?? "/default-cover.png";

  const handleSave = async () => {
    if (!canSave) return;

    const nextTitle = normalizedTitle;
    if (!nextTitle) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload: {
      title?: string;
      description?: string;
      privacy?: "public" | "private";
      coverUrl?: string;
    } = {};

    if (nextTitle !== playlist.title) payload.title = nextTitle;
    if (normalizedDescription !== (playlist.description ?? "")) {
      payload.description = normalizedDescription;
    }
    if (privacy !== playlist.privacy) payload.privacy = privacy;
    if (uploadedCoverUrl) payload.coverUrl = uploadedCoverUrl;

    const response = await playlistService.updateCollection(
      playlist.id,
      payload,
    );
    setSaving(false);

    if (!response) {
      setError("Could not save changes.");
      return;
    }

    onSaved?.();
    onClose();
  };

  const handleRemoveTrack = async (trackId: string, trackTitle: string) => {
    if (removingTrackIds.has(trackId)) return;

    setError(null);
    setRemovingTrackIds((prev) => {
      const next = new Set(prev);
      next.add(trackId);
      return next;
    });

    const ok = await playlistService.removeTrack(playlist.id, { trackId });

    setRemovingTrackIds((prev) => {
      const next = new Set(prev);
      next.delete(trackId);
      return next;
    });

    if (!ok) {
      setError(`Could not remove "${trackTitle}" from this playlist.`);
      return;
    }

    setLocalTracks((prev) => prev.filter((item) => item.track.id !== trackId));
    onSaved?.();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] overflow-y-auto hide-scrollbar bg-white/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button
        onClick={onClose}
        className="fixed right-6 top-6 z-[122] flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
        aria-label="Close edit playlist overlay"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="mx-auto mb-8 mt-10 max-h-[calc(100vh-5rem)] w-[min(760px,92vw)] overflow-y-auto hide-scrollbar rounded-sm border border-zinc-800 bg-[#0a0a0c] p-3 shadow-2xl">
        <div className="mb-4 flex items-center">
          <div className="flex items-center gap-6 text-[20px] font-bold">
            <button
              className={`relative pb-2 transition ${
                activeTab === "basic"
                  ? "text-white after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-white after:content-['']"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              type="button"
              onClick={() => setActiveTab("basic")}
            >
              Basic info
            </button>
            <button
              className={`relative pb-2 transition ${
                activeTab === "tracks"
                  ? "text-white after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-white after:content-['']"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              type="button"
              onClick={() => setActiveTab("tracks")}
            >
              Tracks
            </button>
            <button
              className={`relative pb-2 transition ${
                activeTab === "metadata"
                  ? "text-white after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-white after:content-['']"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              type="button"
              onClick={() => setActiveTab("metadata")}
            >
              Metadata
            </button>
          </div>
        </div>

        {activeTab === "basic" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[180px_1fr]">
            <div>
              <div className="relative h-[170px] overflow-hidden rounded-sm bg-gradient-to-b from-[#8f6f86] to-[#8ca9b8]">
                <img
                  src={imageSrc}
                  alt={playlist.title}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-5 left-1/2 min-w-[116px] -translate-x-1/2 whitespace-nowrap rounded bg-black px-3 py-1.5 text-xs font-semibold leading-none text-white"
                >
                  {isUploadingCover ? "Uploading..." : "Upload image"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setCoverChanged(true);
                    setPreviewUrl(URL.createObjectURL(file));
                    setError(null);
                    setIsUploadingCover(true);

                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append(
                        "upload_preset",
                        "tunify_avatars_coverImgs",
                      );

                      const cloudRes = await fetch(
                        "https://api.cloudinary.com/v1_1/dcctvg2ay/image/upload",
                        { method: "POST", body: formData },
                      );

                      const cloudData = await cloudRes.json();
                      if (!cloudRes.ok || !cloudData?.secure_url) {
                        throw new Error("Upload failed");
                      }

                      setUploadedCoverUrl(cloudData.secure_url);
                    } catch {
                      setUploadedCoverUrl(null);
                      setError("Cover upload failed. Please try again.");
                    } finally {
                      setIsUploadingCover(false);
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className={labelClass}>Title*</div>
                <input
                  className={fieldClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <div className={labelClass}>Permalink*</div>
                <div
                  className={`${fieldClass} flex items-center text-zinc-400`}
                >
                  <span>{permalink}</span>
                </div>
              </div>

              {/* <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <div className={labelClass}>Playlist type</div>
                  <div className={`${fieldClass} flex items-center justify-between`}>
                    <span>{playlist.type === "PLAYLIST" ? "Playlist" : "Album"}</span>
                    <ChevronDown size={18} className="text-zinc-400" />
                  </div>
                </div>
                <div>
                  <div className={labelClass}>Release date</div>
                  <div className={`${fieldClass} flex items-center justify-between text-zinc-500`}>
                    <span>DD/MM/YYYY</span>
                    <Calendar size={18} className="text-zinc-400" />
                  </div>
                </div>
              </div> */}

              {/* <div>
                <div className={labelClass}>Genre</div>
                <div className={`${fieldClass} flex items-center justify-between`}>
                  <span>None</span>
                  <ChevronDown size={18} className="text-zinc-400" />
                </div>
              </div> */}

              {/* <div>
                <div className={labelClass}>Additional tags</div>
                <input className={fieldClass} placeholder="Add tags to describe the genre and mood of your playlist" />
              </div> */}

              <div>
                <div className={labelClass}>Description</div>
                <textarea
                  className="h-24 w-full rounded-sm bg-zinc-800 px-4 py-3 text-zinc-100 outline-none placeholder:text-zinc-500 focus:ring-1 focus:ring-zinc-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your playlist"
                />
              </div>

              <div>
                <div className={`${labelClass} mb-1`}>Privacy:</div>
                <label className="mb-1 flex cursor-pointer items-center gap-2 text-base text-white">
                  <input
                    type="radio"
                    checked={privacy === "public"}
                    onChange={() => setPrivacy("public")}
                  />
                  <span>Public</span>
                </label>
                <div className="ml-6 text-sm text-zinc-400">
                  Anyone will be able to listen to this playlist.
                </div>
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-base text-white">
                  <input
                    type="radio"
                    checked={privacy === "private"}
                    onChange={() => setPrivacy("private")}
                  />
                  <span>Private</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "tracks" && (
          <div className="space-y-3">
            {localTracks.length > 0 ? (
              <ul className="space-y-1">
                {localTracks.map((ct) => (
                  <li
                    key={ct.track.id}
                    className="flex items-center justify-between gap-3 px-1 py-1.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={ct.track.coverUrl || "/default-cover.png"}
                        alt={ct.track.title}
                        className="h-9 w-9 shrink-0 object-cover"
                      />
                      <p className="truncate text-[14px] font-semibold leading-none text-zinc-100">
                        <span className="text-zinc-200">
                          {ct.track.user.displayName || ct.track.user.username}
                        </span>
                        <span className="mx-1 text-zinc-500">-</span>
                        <span>{ct.track.title}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4 text-zinc-300">
                      <span className="text-[12px] leading-none">
                        {formatTrackDuration(ct.track.durationSeconds)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          void handleRemoveTrack(ct.track.id, ct.track.title)
                        }
                        disabled={removingTrackIds.has(ct.track.id)}
                        aria-label={`Remove ${ct.track.title} from playlist`}
                        className="text-zinc-400 transition hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 text-sm text-zinc-400">
                No tracks in this playlist yet.
              </div>
            )}
          </div>
        )}

        {activeTab === "metadata" && (
          <div className="py-6 text-sm text-zinc-400">
            Metadata settings are not available yet.
          </div>
        )}

        <div className="mt-5">
          <div className="text-sm font-semibold text-zinc-200">
            <span className="text-pink-500">*</span> Required fields
          </div>

          {error && (
            <div className="mt-3 text-sm font-semibold text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm bg-zinc-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={!canSave}
              className="rounded-sm bg-zinc-300 px-3 py-1.5 text-xs font-bold text-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPlaylistOverlay;
