import { useRef, useState } from "react";
import { playlistService } from "../../../../libraryService";
import type { Collection, CollectionTrack } from "../../../../types";

interface Props {
  playlist: Collection;
  tracks?: CollectionTrack[];
  onUpdate?: () => void;
  isMe?: boolean;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatCreatedAtAgo(createdAt: string) {
  const createdMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdMs)) return "just now";

  const diffMs = Date.now() - createdMs;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (diffMs < hour) {
    const mins = Math.max(1, Math.floor(diffMs / minute));
    return `${mins} min ago`;
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  if (diffMs < month) {
    const days = Math.floor(diffMs / day);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }
  if (diffMs < year) {
    const months = Math.floor(diffMs / month);
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }

  const years = Math.floor(diffMs / year);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

const PlaylistHeader: React.FC<Props> = ({ playlist, tracks = [], onUpdate, isMe }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const trackCount = playlist.trackCount ?? tracks.length ?? 0;
  const createdAtAgo = formatCreatedAtAgo(playlist.createdAt);
  const totalDuration = tracks.reduce(
    (sum, item) => sum + (item.track.durationSeconds || 0),
    0,
  );

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "tunify_avatars_coverImgs");

      const cloudRes = await fetch(
        "https://api.cloudinary.com/v1_1/dcctvg2ay/image/upload",
        { method: "POST", body: formData }
      );

      const cloudData = await cloudRes.json();

      // Persist the new cover using the collection update endpoint
      await playlistService.updateCollection(playlist.id, {
        coverUrl: cloudData.secure_url,
      });

      onUpdate?.(); // 👈 same as profile

    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative min-h-[345px] overflow-hidden rounded-sm bg-gradient-to-r from-[#8e837c] via-[#6f6866] to-[#232326] p-7">
      <div className="absolute mr-8 right-[316px] top-9 z-10 text-[13px] font-semibold leading-none text-white">
        {createdAtAgo}
      </div>
      <div className="absolute right-7 top-7 h-[288px] w-[288px] overflow-hidden rounded-lg bg-zinc-900 shadow-lg">
        <img
          src={previewUrl ?? playlist.coverUrl ?? "/default-cover.png"}
          className="h-full w-full object-cover"
          alt={playlist.title}
        />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-semibold text-white">
            Uploading...
          </div>
        )}
        {isMe && (
          <>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-7 left-1/2 -translate-x-1/2 rounded bg-black px-4 py-1.5 text-sm font-semibold text-white hover:bg-zinc-900"
            >
              Upload image
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
            />
          </>
        )}
      </div>

      <div className="max-w-[calc(100%-320px)]">
        <div className="flex items-start gap-3">
          <button
            className="mt-1 flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[#0a0e14] text-white"
            aria-label="Play playlist"
          >
            <svg width="45" height="45" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

          <div className="ml-6">
            <div>
              <span className="inline-flex items-center bg-black text-white font-bold text-2xl md:text-3xl lg:text-3xl px-2">
                {playlist.title}
              </span>
            </div>
            <div>
              <span className="bg-black font-bold text-gray-400 text-base md:text-[16px] px-2 py-1">
                {playlist.owner?.displayName || playlist.owner?.username}
              </span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-7 left-7 flex h-[94px] w-[94px] flex-col items-center justify-center rounded-full bg-[#0a0e14] text-white">
          <span className="text-3xl font-bold leading-none">{trackCount}</span>
          <span className="mt-1 text-xs font-semibold uppercase tracking-[0.08em]">
            Track
          </span>
          <span className="text-[11px] text-gray-400 font-bold">
            {formatDuration(totalDuration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlaylistHeader;
