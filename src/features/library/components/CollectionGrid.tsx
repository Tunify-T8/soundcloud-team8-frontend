import { Link } from "react-router-dom";
import type { CollectionItem } from "../types";
import MediaCard from "./MediaCard";

interface CollectionGridProps {
  items: CollectionItem[];
  title: string;
  showBrowse?: boolean;
}

export default function CollectionGrid({ items, title, showBrowse = false }: CollectionGridProps) {
  return (
    <section className="mb-8" data-testid="collection-grid">
      <div className="flex items-center justify-between mb-4">
        {title && <h2 className="text-white font-bold text-sm" data-testid="collection-grid-title">{title}</h2>}
        {showBrowse && (
          <Link
            to="/home"
            className="text-zinc-500 text-xs transition-colors duration-150 hover:text-white cursor-pointer"
          >
            Browse trending playlists
          </Link>
        )}
      </div>
      <div className="grid grid-cols-6 gap-4">
        {items.map((item) => (
          <MediaCard
            key={item.id}
            id={item.id}
            title={item.title}
            subtitle={item.subtitle ?? ""}
            coverUrl={item.coverUrl}
          />
        ))}
      </div>
    </section>
  );
}