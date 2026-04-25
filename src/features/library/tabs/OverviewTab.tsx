import CollectionGrid from "../components/CollectionGrid";
import EmptyCollectionGrid from "../components/EmptyCollectionGrid";
import FollowingSection from "../components/FollowingSection";
import TrackRow from "../components/TrackRow";
import { useRecentlyPlayed } from "@/features/playerUI/context/useRecentlyPlayed";
import { LIKED_TRACKS, FOLLOWING } from "../tests/mockdata";

const COLS = 6;

export default function OverviewTab() {
  const recentlyPlayed = useRecentlyPlayed();
  const totalSlots = Math.ceil(Math.max(LIKED_TRACKS.length, 1) / COLS) * COLS;

  const recentlyPlayedItems = recentlyPlayed.map((entry) => ({
    id: entry.id,
    title: entry.title,
    subtitle: "",
    coverUrl: entry.artworkUrl,
  }));

  return (
    <div data-testid="overview-tab">
      {recentlyPlayedItems.length > 0 && (
        <CollectionGrid items={recentlyPlayedItems} title="Recently played" />
      )}

      <section className="mb-8" data-testid="overview-likes-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-sm">Likes</h2>
        </div>
        {LIKED_TRACKS.length === 0 ? (
          <EmptyCollectionGrid title="" emptyMessage="You haven't liked any tracks yet" />
        ) : (
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: totalSlots }).map((_, i) => {
              const track = LIKED_TRACKS[i];
              return track ? (
                <TrackRow key={track.id} track={track} view="grid" isLiked={true} />
              ) : (
                <div key={i} data-testid={`likes-empty-slot-${i}`} className="w-full aspect-square rounded-sm bg-[#282828]" />
              );
            })}
          </div>
        )}
      </section>

      <EmptyCollectionGrid title="Playlists" emptyMessage="You have no playlists yet" />
      <EmptyCollectionGrid title="Albums" emptyMessage="You haven't liked any albums yet" />
      <EmptyCollectionGrid title="Liked Stations" emptyMessage="You haven't liked any stations yet" />
      <FollowingSection users={FOLLOWING} />
    </div>
  );
}