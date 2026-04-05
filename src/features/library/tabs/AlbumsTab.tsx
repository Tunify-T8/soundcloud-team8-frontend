import EmptyList from "../components/EmptyList";
import type { CollectionItem } from "../types";

const albums: CollectionItem[] = [];

export default function AlbumsTab() {
  return (
    <div>
      <h2 className="text-white font-bold text-base mb-6">Albums you've liked:</h2>
      {albums.length === 0
        ? <EmptyList message="You haven't liked any albums yet" />
        : null
      }
    </div>
  );
}
