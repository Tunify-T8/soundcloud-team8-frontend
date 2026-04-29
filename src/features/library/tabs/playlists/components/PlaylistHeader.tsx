import { useRef, useState } from "react";
import { playlistService } from "../../../libraryService";
import type { Collection, CollectionTrack } from "../../../types";
import trackFallback from "@/assets/track.jpg";

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

const PlaylistHeader: React.FC<Props> = ({
  playlist,
  tracks = [],
  onUpdate,
  isMe,
}) => {
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
        { method: "POST", body: formData },
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
    <div className="relative overflow-hidden rounded-sm bg-gradient-to-r from-[#8e837c] via-[#6f6866] to-[#232326] p-5 sm:p-7">
      {/* Date — desktop only, sits above the cover in the gap */}
      <div className="absolute right-[316px] top-9 z-10 hidden text-[13px] font-semibold leading-none text-white md:block">
        {createdAtAgo}
      </div>

      <div className="flex flex-col items-center gap-5 md:flex-row md:items-start">
        {/* Cover image — centered on mobile, right side on desktop */}
        <div className="relative h-[200px] w-[200px] shrink-0 overflow-hidden rounded-lg bg-zinc-900 shadow-lg sm:h-[240px] sm:w-[240px] md:order-last md:h-[288px] md:w-[288px]">
          <img
            src={previewUrl ?? playlist.coverUrl ?? trackFallback}
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
                className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded bg-black px-4 py-1.5 text-sm font-semibold text-white hover:bg-zinc-900"
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

        {/* Left content */}
        <div className="flex w-full flex-1 flex-col gap-5 md:min-h-[288px] md:justify-between">
          {/* Date — mobile only, inline */}
          <div className="text-center text-[13px] font-semibold text-white md:hidden">
            {createdAtAgo}
          </div>

          {/* Play button + title */}
          <div className="flex items-start gap-3">
            <button
              className="mt-1 flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-[#0a0e14] text-white sm:h-[56px] sm:w-[56px]"
              aria-label="Play playlist"
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <div className="ml-2 sm:ml-6">
              <div>
                <span className="inline-flex items-center bg-black px-2 text-xl font-bold text-white sm:text-2xl md:text-3xl">
                  {playlist.title}
                </span>
              </div>
              <div>
                <span className="bg-black px-2 py-1 text-sm font-bold text-gray-400 md:text-[16px]">
                  {playlist.owner?.displayName || playlist.owner?.username}
                </span>
              </div>
            </div>
          </div>

          {/* Track count circle */}
          <div className="mx-auto flex h-[80px] w-[80px] flex-col items-center justify-center rounded-full bg-[#0a0e14] text-white md:mx-0 md:h-[94px] md:w-[94px]">
            <span className="text-2xl font-bold leading-none md:text-3xl">{trackCount}</span>
            <span className="mt-1 text-xs font-semibold uppercase tracking-[0.08em]">Track</span>
            <span className="text-[11px] font-bold text-gray-400">{formatDuration(totalDuration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistHeader;
