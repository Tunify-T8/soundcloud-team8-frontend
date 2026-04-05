import type { CollectionItem } from "../types";

interface CollectionGridProps {
  items: CollectionItem[];
  title: string;
  showBrowse?: boolean;
}

export default function CollectionGrid({ items, title, showBrowse = false }: CollectionGridProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-sm">{title}</h2>
        {showBrowse && (
          <span className="text-zinc-500 text-xs hover:text-white cursor-pointer">Browse trending playlists</span>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {items.map((item) => (
          <div key={item.id} className="flex-shrink-0 w-[170px] cursor-pointer group">
            <div className="w-[170px] h-[170px] rounded-sm overflow-hidden mb-2 relative bg-[#282828]">
              {item.coverUrl ? (
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-[#282828]" />
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
            <p className="text-white text-xs font-semibold truncate">{item.title}</p>
            <p className="text-zinc-500 text-xs truncate mt-0.5">{item.subtitle}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
