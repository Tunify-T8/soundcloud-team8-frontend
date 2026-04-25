import CollectionGrid from "../components/CollectionGrid";
import EmptyCollectionGrid from "../components/EmptyCollectionGrid";
import FollowingSection from "../components/FollowingSection";
import TrackRow from "../components/TrackRow";
import { useRecentlyPlayed } from "@/features/playerUI/context/useRecentlyPlayed";
import { LIKED_TRACKS, FOLLOWING, ALBUMS, HISTORY_TRACKS } from "../tests/mockdata";
import MediaCard from "../components/MediaCard";

const COLS = 6;

export default function OverviewTab() {
  const recentlyPlayed = useRecentlyPlayed();

  const recentlyPlayedItems = recentlyPlayed.map((entry) => ({
    id: entry.id,
    title: entry.title,
    subtitle: "",
    coverUrl: entry.artworkUrl,
  }));

  const likedTotalSlots = Math.ceil(Math.max(LIKED_TRACKS.length, 1) / COLS) * COLS;
  const albumTotalSlots = Math.ceil(Math.max(ALBUMS.length, 1) / COLS) * COLS;
  const historyTotalSlots = Math.ceil(Math.max(HISTORY_TRACKS.length, 1) / COLS) * COLS;

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
            {Array.from({ length: likedTotalSlots }).map((_, i) => {
              const track = LIKED_TRACKS[i];
              return track ? (
                <TrackRow key={track.id} track={track} view="grid" isLiked={true} />
              ) : (
                <div key={i} data-testid={`overview-likes-slot-${i}`} className="w-full aspect-square rounded-sm bg-[#282828]" />
              );
            })}
          </div>
        )}
      </section>

      <EmptyCollectionGrid title="Playlists" emptyMessage="You have no playlists yet" />

      <section className="mb-8" data-testid="overview-albums-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-sm">Albums</h2>
        </div>
        {ALBUMS.length === 0 ? (
          <EmptyCollectionGrid title="" emptyMessage="You haven't liked any albums yet" />
        ) : (
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: albumTotalSlots }).map((_, i) => {
              const item = ALBUMS[i];
              return item ? (
                <MediaCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  subtitle={item.subtitle ?? ""}
                  coverUrl={item.coverUrl}
                />
              ) : (
                <div key={i} data-testid={`overview-album-slot-${i}`} className="w-full aspect-square rounded-sm bg-[#282828]" />
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-8" data-testid="overview-history-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-sm">History</h2>
        </div>
        {HISTORY_TRACKS.length === 0 ? (
          <EmptyCollectionGrid title="" emptyMessage="You have no listening history yet" />
        ) : (
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: historyTotalSlots }).map((_, i) => {
              const track = HISTORY_TRACKS[i];
              return track ? (
                <MediaCard
                  key={track.id}
                  id={track.id}
                  title={track.title}
                  subtitle={track.artist}
                  coverUrl={track.coverUrl}
                />
              ) : (
                <div key={i} data-testid={`overview-history-slot-${i}`} className="w-full aspect-square rounded-sm bg-[#282828]" />
              );
            })}
          </div>
        )}
      </section>

      <EmptyCollectionGrid title="Playlists" />
      <EmptyCollectionGrid title="Albums" />
      <EmptyCollectionGrid title="Liked Stations" />
      <EmptyCollectionGrid title="Liked Stations" emptyMessage="You haven't liked any stations yet" />
      <FollowingSection users={FOLLOWING} />
    </div>
  );
}