"use client";
import { useEffect, useState } from "react";
import SideBar from "@/components/layout/Sidebar";
import type {
  DiscoverArtist,
  DiscoverTrack,
} from "@/features/discover/Discover";
import { ArtistsToWatchSection } from "../components/ArtistsToWatchSection";
import { DiscoverSection } from "../components/DiscoverSection";
import {
  getDiscoverTracks,
  getSuggestedArtists,
  getTrendingAlbums,
  getTrendingTracks,
} from "../discoverService";

export default function DiscoverPage() {
  const [discoverTracks, setDiscoverTracks] = useState<DiscoverTrack[]>([]);
  const [albumTracks, setAlbumTracks] = useState<DiscoverTrack[]>([]);
  const [madeForYouTracks, setMadeForYouTracks] = useState<DiscoverTrack[]>([]);
  const [artistsToWatchTracks, setArtistsToWatchTracks] = useState<
    DiscoverArtist[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const discoverSections = [
    { title: "More of what you like", tracks: discoverTracks },
    // {
    //   title: "Recently Played",
    //   tracks: recentlyPlayedTracks,
    // },
    {
      title: "Albums for you",
      tracks: discoverTracks,
    },
    {
      title: "Made for you",
      tracks: madeForYouTracks,
    },
  ];

  const hasAnyTracks =
    discoverSections.some((section) => section.tracks.length > 0) ||
    artistsToWatchTracks.length > 0;

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="mx-auto flex w-full max-w-340 gap-10 px-8 py-8">
        <main className="flex-1 overflow-hidden ml-6">
          {isLoading ? (
            <p className="text-zinc-400">Loading discover tracks...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : !hasAnyTracks ? (
            <p className="text-zinc-400">No discover tracks yet.</p>
          ) : (
            <>
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

        <aside className="sticky top-6 self-start h-[calc(100vh-3rem)] w-90 shrink-0 overflow-y-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <SideBar />
        </aside>
      </div>
    </div>
  );
}
