import CollectionGrid from "../components/CollectionGrid";
import EmptyCollectionGrid from "../components/EmptyCollectionGrid";
import FollowingSection from "../components/FollowingSection";
import TrackRow from "../components/TrackRow";
import { RECENTLY_PLAYED, LIKED_TRACKS, FOLLOWING } from "../tests//mockdata";

const COLS = 6;

export default function OverviewTab() {
  const totalSlots = Math.ceil(Math.max(LIKED_TRACKS.length, 1) / COLS) * COLS;

  return (
    <div>
      <CollectionGrid items={RECENTLY_PLAYED} title="Recently played" />

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-sm">Likes</h2>
          <span className="text-zinc-500 text-xs hover:text-white cursor-pointer">Browse trending playlists</span>
        </div>
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: totalSlots }).map((_, i) => {
            const track = LIKED_TRACKS[i];
            return track ? (
              <TrackRow key={track.id} track={track} view="grid" />
            ) : (
              <div key={i} className="w-full aspect-square rounded-sm bg-[#282828]" />
            );
          })}
        </div>
      </section>

      <EmptyCollectionGrid title="Playlists" />
      <EmptyCollectionGrid title="Albums" />
      <EmptyCollectionGrid title="Liked Stations" />
      <FollowingSection users={FOLLOWING} />
    </div>
  );
}
