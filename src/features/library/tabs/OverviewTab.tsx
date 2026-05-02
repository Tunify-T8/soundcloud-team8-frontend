import { useEffect, useState } from "react";
import CollectionGrid from "../components/CollectionGrid";
import EmptyCollectionGrid from "../components/EmptyCollectionGrid";
import FollowingSection from "../components/FollowingSection";
import TrackRow from "../components/TrackRow";
import { useRecentlyPlayed } from "@/features/playerUI/context/useRecentlyPlayed";
import { followingService } from "@/features/following/followingService";
import MediaCard from "../components/MediaCard";
import {
  getLikedTracks,
  mapLikedTrackToTrackItem,
  playlistService,
} from "../libraryService";
import { feedService } from "@/features/feed/feedservice";
import type { CollectionPreview, FollowingUser, TrackItem } from "../types";

const COLS = 6;

export default function OverviewTab() {
  const recentlyPlayed = useRecentlyPlayed();
  const [likedTracks, setLikedTracks] = useState<TrackItem[]>([]);
  const [playlists, setPlaylists] = useState<CollectionPreview[]>([]);
  const [albums, setAlbums] = useState<CollectionPreview[]>([]);
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([]);

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

  useEffect(() => {
    let isMounted = true;

    const fetchCollections = async () => {
      const [playlistsResponse, albumsResponse] = await Promise.all([
        playlistService.getMyCollections(1, 6, "PLAYLIST"),
        playlistService.getMyCollections(1, 6, "ALBUM"),
      ]);

      if (!isMounted) return;
      setPlaylists(playlistsResponse?.data ?? []);
      setAlbums(albumsResponse?.data ?? []);
    };

    void fetchCollections();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchFollowing = async () => {
      try {
        const response = await followingService.getMeFollowing(1, 12);
        if (!isMounted) return;
        const mapped = response.following.map((user) => ({
          id: user.id,
          name: user.displayName ?? user.username,
          avatarUrl: user.avatarUrl ?? undefined,
          followers: (user.followersCount ?? 0).toLocaleString(),
          verified: Boolean(user.isCertified),
        }));
        setFollowingUsers(mapped);
      } catch {
        if (!isMounted) return;
        setFollowingUsers([]);
      }
    };

    void fetchFollowing();
    return () => {
      isMounted = false;
    };
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
    entityType: entry.entityType ?? ("track" as const),
    linkTo:
      entry.linkTo ??
      ((entry.entityType ?? "track") === "playlist" ||
      (entry.entityType ?? "track") === "album"
        ? `/collections/${entry.id}`
        : `/tracks/${entry.id}`),
  }));

  const likedTotalSlots =
    Math.ceil(Math.max(likedTracks.length, 1) / COLS) * COLS;
  const playlistTotalSlots =
    Math.ceil(Math.max(playlists.length, 1) / COLS) * COLS;
  const albumTotalSlots = Math.ceil(Math.max(albums.length, 1) / COLS) * COLS;

  return (
    <div data-testid="overview-tab">
      {recentlyPlayedItems.length > 0 && (
        <CollectionGrid
          items={recentlyPlayedItems}
          title="Recently played"
          hoverVariant="dim"
        />
      )}

      <section className="mb-8" data-testid="overview-likes-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-sm">Likes</h2>
        </div>
        {likedTracks.length === 0 ? (
          <EmptyCollectionGrid
            title=""
            emptyMessage="You haven't liked any tracks yet"
          />
        ) : (
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: likedTotalSlots }).map((_, i) => {
              const track = likedTracks[i];
              return track ? (
                <TrackRow
                  key={track.id}
                  track={track}
                  view="grid"
                  isLiked={true}
                  onUnlike={handleUnlike}
                />
              ) : (
                <div
                  key={i}
                  data-testid={`overview-likes-slot-${i}`}
                  className="w-full aspect-square rounded-sm bg-[#282828]"
                />
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-8" data-testid="overview-playlists-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-sm">Playlists</h2>
        </div>
        {playlists.length === 0 ? (
          <EmptyCollectionGrid
            title=""
            emptyMessage="You have no playlists yet"
          />
        ) : (
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: playlistTotalSlots }).map((_, i) => {
              const item = playlists[i];
              return item ? (
                <MediaCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  subtitle={`${item.trackCount ?? 0} tracks`}
                  coverUrl={item.coverUrl}
                  linkTo={`/collections/${item.id}`}
                  isLiked={item.isLiked}
                />
              ) : (
                <div
                  key={i}
                  data-testid={`overview-playlist-slot-${i}`}
                  className="w-full aspect-square rounded-sm bg-[#282828]"
                />
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-8" data-testid="overview-albums-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-sm">Albums</h2>
        </div>
        {albums.length === 0 ? (
          <EmptyCollectionGrid
            title=""
            emptyMessage="You haven't liked any albums yet"
          />
        ) : (
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: albumTotalSlots }).map((_, i) => {
              const item = albums[i];
              return item ? (
                <MediaCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  subtitle={`${item.trackCount ?? 0} tracks`}
                  coverUrl={item.coverUrl}
                  linkTo={`/collections/${item.id}`}
                  isLiked={item.isLiked}
                />
              ) : (
                <div
                  key={i}
                  data-testid={`overview-album-slot-${i}`}
                  className="w-full aspect-square rounded-sm bg-[#282828]"
                />
              );
            })}
          </div>
        )}
      </section>

      <FollowingSection users={followingUsers} />
    </div>
  );
}
