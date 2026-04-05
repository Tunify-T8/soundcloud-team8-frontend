import type { CollectionItem } from "../types";

const COLS = 6;
const playlists: CollectionItem[] = [];

function PlaylistCard({ item }: { item: CollectionItem }) {
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
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="black">
              <polygon points="2,0 16,7 2,14" />
            </svg>
          </div>
        </div>
      </div>
      <p className="text-white text-xs font-bold truncate">{item.title}</p>
      <p className="text-zinc-400 text-xs truncate">{item.subtitle}</p>
    </div>
  );
}

export default function PlaylistsTab() {
  const totalSlots = Math.ceil(Math.max(playlists.length, 1) / COLS) * COLS;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-sm">Hear your own playlists and the playlists you've liked:</h2>
        <input
          placeholder="Filter"
          className="bg-[#282828] border border-zinc-700 rounded-sm px-3 py-1 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 w-64"
        />
      </div>

      {playlists.length === 0 ? (
          <p className="text-white font-bold text-lg text-center py-20">
            You have not liked any playlists yet
          </p>
        ) : (
          <div className="grid grid-cols-6 gap-4">
        {Array.from({ length: totalSlots }).map((_, i) => {
          const item = playlists[i];
          return item ? (
            <PlaylistCard key={item.id} item={item} />
          ) : (
            <div key={i} className="w-full aspect-square rounded-sm bg-[#282828]" />
          );
        })}
      </div>
        )}
     
    </div>
  );
}
