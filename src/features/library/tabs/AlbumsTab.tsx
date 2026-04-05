import type { CollectionItem } from "../types";

const COLS = 6;
const albums: CollectionItem[] = [];

function AlbumCard({ item }: { item: CollectionItem }) {
  return (
    <div className="cursor-pointer group">
      <div className="w-full aspect-square rounded-sm overflow-hidden mb-2 relative bg-[#282828]">
        {item.coverUrl && (
          <img
            src={item.coverUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>
      <p className="text-white text-xs font-bold truncate">{item.title}</p>
      <p className="text-zinc-400 text-xs truncate">{item.subtitle}</p>
    </div>
  );
}

export default function AlbumsTab() {
  const totalSlots = Math.ceil(Math.max(albums.length, 1) / COLS) * COLS;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-sm">Albums you've liked:</h2>
        <input
          placeholder="Filter"
          className="bg-[#282828] border border-zinc-700 rounded-sm px-3 py-1 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 w-64"
        />
      </div>

      <div className="grid grid-cols-6 gap-4">
        {Array.from({ length: totalSlots }).map((_, i) => {
          const item = albums[i];
          return item ? (
            <AlbumCard key={item.id} item={item} />
          ) : (
            <div key={i} className="w-full aspect-square rounded-sm bg-[#282828]" />
          );
        })}
      </div>
    </div>
  );
}
