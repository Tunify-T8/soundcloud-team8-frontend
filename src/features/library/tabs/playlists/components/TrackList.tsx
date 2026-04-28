import { Play } from "lucide-react";
import type { CollectionTrack } from "../../../types";
import trackFallback from "@/assets/track.jpg";

function formatCompactNumber(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return null;
  return Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
}

const TrackList: React.FC<{ tracks: CollectionTrack[] }> = ({ tracks }) => {
  return (
    <ul>
      {tracks.map((ct, i) => (
        <li
          key={ct.track.id}
          className="flex items-center justify-between gap-3 px-2 py-2.5 transition hover:bg-zinc-900/60"
        >
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={ct.track.coverUrl || trackFallback}
              alt={ct.track.title}
              className="h-7 w-7 shrink-0 object-cover"
            />
            <p className="truncate text-[13px] font-semibold leading-none text-zinc-100">
              <span className="text-zinc-500 font-bold">{i + 1}</span>
              <span className="text-zinc-500 font-bold">. </span>
              <span className="text-zinc-500 font-bold">
                {ct.track.user.displayName || ct.track.user.username}
              </span>
              <span className="text-zinc-300"> . </span>
              <span>{ct.track.title}</span>
            </p>
          </div>

          <div className="ml-2 flex shrink-0 items-center gap-1 text-zinc-400">
            <Play size={10} fill="currentColor" />
            <span className="text-[12px] font-medium leading-none">
              {formatCompactNumber(
                (ct.track as { playCount?: number; playsCount?: number })
                  .playCount ??
                  (ct.track as { playCount?: number; playsCount?: number })
                    .playsCount,
              ) || "0"}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TrackList;
