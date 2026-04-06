import type { DiscoverTrack } from "@/shared/types/Discover";

export function DiscoverCard({
  item,
  index,
}: {
  item: DiscoverTrack;
  index: number;
}) {
  const badgeColors = [
    "bg-violet-300 text-zinc-900",
    "bg-blue-500 text-zinc-900",
    "bg-zinc-200 text-zinc-900",
    "bg-orange-500 text-zinc-900",
  ];
  const badgeClass = badgeColors[index % badgeColors.length];

  return (
    <div className="w-37.5 shrink-0">
      <div className="relative overflow-hidden rounded-sm bg-zinc-800 shadow-sm shadow-black/30">
        <img
          src={item.coverUrl}
          alt={item.title}
          className="h-37.5 w-37.5 object-cover"
        />

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
