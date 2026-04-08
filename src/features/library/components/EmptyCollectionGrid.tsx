import { Link } from "react-router-dom";

interface EmptyCollectionGridProps {
  title: string;
  count?: number;
}

export default function EmptyCollectionGrid({ title, count = 6 }: EmptyCollectionGridProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-sm">{title}</h2>
        <Link
          to="/discover"
          className="text-zinc-500 text-xs transition-colors duration-150 hover:text-white cursor-pointer"
        >
          Browse trending playlists
        </Link>
      </div>
      <div className="flex gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[170px] h-[170px] rounded-sm bg-[#282828]" />
        ))}
      </div>
    </section>
  );
}