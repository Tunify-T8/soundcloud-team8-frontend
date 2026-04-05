import EmptyList from "../components/EmptyList";
import type { CollectionItem } from "../types";

const playlists: CollectionItem[] = [];

export default function PlaylistsTab() {
  return (
    <div>
      <h2 className="text-white font-bold text-base mb-6">
        Hear your own playlists and the playlists you've liked:
      </h2>
      {playlists.length === 0
        ? <EmptyList message="You haven't liked any playlists yet" />
        : null
      }
    </div>
  );
}
