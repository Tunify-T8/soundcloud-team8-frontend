import { useEffect, useState } from "react";
import CollectionGrid from "../components/CollectionGrid";
import EmptyCollectionGrid from "../components/EmptyCollectionGrid";
import FollowingSection from "../components/FollowingSection";
import TrackRow from "../components/TrackRow";
import { useRecentlyPlayed } from "@/features/playerUI/context/useRecentlyPlayed";
import { FOLLOWING, ALBUMS, HISTORY_TRACKS } from "../tests/mockdata";
import MediaCard from "../components/MediaCard";
import { getLikedTracks, mapLikedTrackToTrackItem } from "../libraryService";
import { feedService } from "@/features/feed/feedservice";
import type { TrackItem } from "../types";

const COLS = 6;

export default function OverviewTab() {
  const recentlyPlayed = useRecentlyPlayed();
  const [likedTracks, setLikedTracks] = useState<TrackItem[]>([]);

  useEffect(() => {
    const fetchLikedTracks = async () => {
      const response = await getLikedTracks(1, 6);
      if (response) {
        const mapped = response.data.map(mapLikedTrackToTrackItem);
        setLikedTracks(mapped);
      }
    };
    void fetchLikedTracks();
  }, []);

  const handleUnlike = async (trackId: string) => {
    await feedService.unlikeTrack(trackId);
    setLikedTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  const recentlyPlayedItems = recentlyPlayed.map((entry) => ({
    id: entry.id,
    title: entry.title,
    subtitle: "",
    coverUrl: entry.artworkUrl,
  }));

  const likedTotalSlots = Math.ceil(Math.max(likedTracks.length, 1) / COLS) * COLS;
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
        {likedTracks.length === 0 ? (
          <EmptyCollectionGrid title="" emptyMessage="You haven't liked any tracks yet" />
        ) : (
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: likedTotalSlots }).map((_, i) => {
              const track = likedTracks[i];
              return track ? (
                <TrackRow key={track.id} track={track} view="grid" isLiked={true} onUnlike={handleUnlike} />
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