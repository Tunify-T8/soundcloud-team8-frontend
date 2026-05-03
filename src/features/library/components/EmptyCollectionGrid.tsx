import { Link } from "react-router-dom";

interface EmptyCollectionGridProps {
  title: string;
  emptyMessage?: string;
  count?: number;
}

export default function EmptyCollectionGrid({ title, emptyMessage, count = 6 }: EmptyCollectionGridProps) {
  return (
    <section className="mb-8" data-testid={`empty-grid-${title.toLowerCase()}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-sm" data-testid="empty-grid-title">{title}</h2>
        <p className="text-zinc-500 text-xs">
          {emptyMessage && <span>{emptyMessage} — </span>}
          <Link
            to="/discover"
            data-testid="browse-trending-link"
            className="font-bold text-zinc-400 hover:text-white transition-colors"
          >
            Browse trending playlists
          </Link>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            data-testid={`empty-slot-${i}`}
            className="w-full aspect-square rounded-sm bg-[#282828]"
          />
        ))}
      </div>
    </section>
  );
}
