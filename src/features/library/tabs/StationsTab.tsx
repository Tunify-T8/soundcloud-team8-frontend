import type { CollectionItem } from "../types";

const COLS = 6;
const stations: CollectionItem[] = [];

function StationCard({ item }: { item: CollectionItem }) {
  return (
    <div className="cursor-pointer group">
      <div className="w-full aspect-square rounded-full overflow-hidden mb-2 relative bg-[#282828]">
        {item.coverUrl && (
          <img
            src={item.coverUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>
      <p className="text-white text-xs font-bold truncate text-center">{item.title}</p>
      <p className="text-zinc-400 text-xs truncate text-center">{item.subtitle}</p>
    </div>
  );
}

export default function StationsTab() {
  const totalSlots = Math.ceil(Math.max(stations.length, 1) / COLS) * COLS;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-sm">Your liked stations:</h2>
        <input
          placeholder="Filter"
          className="bg-[#282828] border border-zinc-700 rounded-sm px-3 py-1 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 w-64"
        />
      </div>

      <div className="grid grid-cols-6 gap-4">
        {Array.from({ length: totalSlots }).map((_, i) => {
          const item = stations[i];
          return item ? (
            <StationCard key={item.id} item={item} />
          ) : (
            <div key={i} className="w-full aspect-square rounded-full bg-[#282828]" />
          );
        })}
      </div>
    </div>
  );
}
