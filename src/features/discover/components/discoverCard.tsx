import type { DiscoverTrack } from "@/features/discover/Discover";
import imageFallback from "@/assets/track.jpg";

export function DiscoverCard({ item }: { item: DiscoverTrack }) {
  return (
    <div className="w-37.5 shrink-0 cursor-pointer group">
      <div className="relative overflow-hidden rounded-sm bg-zinc-800 shadow-sm shadow-black/30">
        <img
          src={item.coverUrl || imageFallback}
          alt={item.title}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = imageFallback;
          }}
          className="h-37.5 w-37.5 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="black"
              aria-hidden="true"
            >
              <polygon points="2,0 16,7 2,14" />
            </svg>
          </div>
        </div>
      </div>

      <p className="mt-2 line-clamp-1 text-[14px] font-semibold leading-tight text-zinc-100">
        {item.title}
      </p>
      <p className=" line-clamp-1 text-[13px] font-semibold leading-tight text-zinc-400">
        {item.artist}
      </p>
    </div>
  );
}
