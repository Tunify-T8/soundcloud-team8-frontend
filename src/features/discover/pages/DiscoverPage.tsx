"use client";
import { useEffect, useMemo, useState } from "react";
import SideBar from "@/components/layout/Sidebar";
import type {
  DiscoverArtist,
  DiscoverTrack,
} from "@/features/discover/Discover";
import { ArtistsToWatchSection } from "../components/ArtistsToWatchSection";
import { DiscoverSection } from "../components/DiscoverSection";
import { LatestUploadSection } from "../components/LatestUploadSection";
import {
  getDiscoverTracks,
  getSuggestedArtists,
  getTrendingAlbums,
  getTrendingTracks,
} from "../discoverService";
import { usePlayContext } from "@/hooks/usePlayContext";
import { useMe } from "@/features/profile/context/useMe";
import { trackService } from "@/features/track-management/trackService";
import type { Track } from "@/shared/types/Track";

export default function DiscoverPage() {
  const [discoverTracks, setDiscoverTracks] = useState<DiscoverTrack[]>([]);
  const [albumTracks, setAlbumTracks] = useState<DiscoverTrack[]>([]);
  const [madeForYouTracks, setMadeForYouTracks] = useState<DiscoverTrack[]>([]);
  const [uploadedTracks, setUploadedTracks] = useState<Track[]>([]);
  const [artistsToWatchTracks, setArtistsToWatchTracks] = useState<
    DiscoverArtist[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { me } = useMe();
  usePlayContext({ contextType: "feed", contextId: me?.id ?? "" });

  useEffect(() => {
    let isMounted = true;

    const fetchDiscoverData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [
          discoverResponse,
          suggestedArtistsResponse,
          trendingAlbumsResponse,
          trendingTracksResponse,
        ] = await Promise.all([
          getDiscoverTracks({ page: 1, limit: 20 }),
          getSuggestedArtists({ page: 1, limit: 10 }),
          getTrendingAlbums({ period: "week" }),
          getTrendingTracks({ type: "track", period: "week" }),
        ]);

        if (isMounted) {
          setDiscoverTracks(
            Array.isArray(discoverResponse.items) ? discoverResponse.items : [],
          );
          setArtistsToWatchTracks(
            Array.isArray(suggestedArtistsResponse.items)
              ? suggestedArtistsResponse.items
              : [],
          );
          setAlbumTracks(
            Array.isArray(trendingAlbumsResponse.items)
              ? trendingAlbumsResponse.items
              : [],
          );
          setMadeForYouTracks(
            Array.isArray(trendingTracksResponse.items)
              ? trendingTracksResponse.items
              : [],
          );
        }
      } catch {
        if (isMounted) {
          setError("Could not load discover data.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchDiscoverData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    trackService
      .getUploadedTracks()
      .then((tracks) => {
        if (!isMounted) return;
        setUploadedTracks(Array.isArray(tracks) ? tracks : []);
      })
      .catch(() => {
        if (!isMounted) return;
        setUploadedTracks([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const latestUploadedTrack = useMemo(() => {
    if (uploadedTracks.length === 0) return null;

    return [...uploadedTracks].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )[0] ?? null;
  }, [uploadedTracks]);

  const discoverSections = [
    { title: "More of what you like", tracks: discoverTracks },
    // {
    //   title: "Recently Played",
    //   tracks: recentlyPlayedTracks,
    // },
    {
      title: "Albums for you",
      tracks: albumTracks,
    },
    {
      title: "Made for you",
      tracks: madeForYouTracks,
    },
  ];

  const hasAnyTracks =
    latestUploadedTrack !== null ||
    discoverSections.some((section) => section.tracks.length > 0) ||
    artistsToWatchTracks.length > 0;

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-3 py-4 sm:px-6 sm:py-8 xl:flex-row xl:gap-10 xl:px-8">
        <main className="min-w-0 flex-1 overflow-hidden">
          {isLoading ? (
            <p className="text-zinc-400">Loading discover tracks...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : !hasAnyTracks ? (
            <p className="text-zinc-400">No discover tracks yet.</p>
          ) : (
            <>
              {latestUploadedTrack ? (
                <LatestUploadSection
                  track={latestUploadedTrack}
                  artistName={me?.displayName || me?.username || latestUploadedTrack.artist}
                  onTrackUpdated={(updatedTrack) => {
                    setUploadedTracks((prev) =>
                      prev.map((track) =>
                        track.id === updatedTrack.id ? updatedTrack : track,
                      ),
                    );
                  }}
                  onTrackDeleted={(trackId) => {
                    setUploadedTracks((prev) =>
                      prev.filter((track) => track.id !== trackId),
                    );
                  }}
                />
              ) : null}
              {discoverSections.map((section) => (
                <DiscoverSection
                  key={section.title}
                  title={section.title}
                  tracks={section.tracks}
                />
              ))}
              <ArtistsToWatchSection
                title="Artists to watch out for"
                artists={artistsToWatchTracks}
              />
            </>
          )}
        </main>

        <aside className="hidden xl:sticky xl:top-6 xl:block xl:h-[calc(100vh-3rem)] xl:w-90 xl:shrink-0 xl:overflow-y-auto xl:pr-2 xl:[scrollbar-width:none] xl:[-ms-overflow-style:none] xl:[&::-webkit-scrollbar]:hidden">
          <SideBar />
        </aside>
      </div>
    </div>
  );
}
