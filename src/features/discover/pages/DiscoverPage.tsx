"use client";
import { useEffect, useState } from "react";
import SideBar from "@/components/layout/Sidebar";
import type {
  DiscoverArtist,
  DiscoverTrack,
  RecommendationItemDto,
} from "@/features/discover/Discover";
import { ArtistsToWatchSection } from "../components/ArtistsToWatchSection";
import { DiscoverSection } from "../components/DiscoverSection";
import {
  getDiscoverTracks,
  getRecommendations,
  getSuggestedArtists,
  getTrendingAlbums,
  getTrendingTracks,
} from "../discoverService";
import { usePlayContext } from "@/hooks/usePlayContext";
import { useMe } from "@/features/profile/context/useMe";

const RECENTLY_PLAYED_KEY = "recentlyPlayed";

type RecentlyPlayedEntry = {
  id: string;
  title: string;
  artworkUrl?: string;
  entityType?: "track" | "playlist" | "album";
  linkTo?: string;
};

function loadRecentlyPlayedFromStorage(): DiscoverTrack[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(RECENTLY_PLAYED_KEY);
    if (!raw) return [];
    const entries = JSON.parse(raw) as RecentlyPlayedEntry[];

    return entries
      .filter((entry) => (entry.entityType ?? "track") === "track")
      .map((entry) => ({
        id: entry.id,
        title: entry.title,
        artist: "Recently played",
        coverUrl: entry.artworkUrl ?? "",
        waveformUrl: "",
        durationSeconds: 0,
        genre: null,
        createdAt: "",
      }));
  } catch {
    return [];
  }
}

const mapRecommendationToDiscoverTrack = (
  item: RecommendationItemDto,
): DiscoverTrack => ({
  id: item.trackId,
  title: item.title,
  artist: item.artist,
  coverUrl: item.coverUrl ?? "",
  waveformUrl: item.waveformUrl ?? "",
  durationSeconds: item.durationInSeconds ?? 0,
  genre: item.genre ?? null,
  createdAt: "",
});

export default function DiscoverPage() {
  const [discoverTracks, setDiscoverTracks] = useState<DiscoverTrack[]>([]);
  const [recentlyPlayedTracks] = useState<DiscoverTrack[]>(
    loadRecentlyPlayedFromStorage,
  );
  const [albumTracks, setAlbumTracks] = useState<DiscoverTrack[]>([]);
  const [madeForYouTracks, setMadeForYouTracks] = useState<DiscoverTrack[]>([]);
  const [trendingByGenreTracks, setTrendingByGenreTracks] = useState<
    DiscoverTrack[]
  >([]);
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
          recommendationsResponse,
          suggestedArtistsResponse,
          trendingAlbumsResponse,
          trendingTracksResponse,
        ] = await Promise.all([
          getDiscoverTracks({ page: 1, limit: 20 }),
          getRecommendations({ page: 1, limit: 20 }),
          getSuggestedArtists({ page: 1, limit: 10 }),
          getTrendingAlbums({ period: "month" }),
          getTrendingTracks({ type: "track", period: "month" }),
        ]);

        if (isMounted) {
          setDiscoverTracks(
            Array.isArray(discoverResponse.items) ? discoverResponse.items : [],
          );
          const recommendations = Array.isArray(recommendationsResponse.data)
            ? recommendationsResponse.data
            : [];

          setMadeForYouTracks(
            recommendations.map(mapRecommendationToDiscoverTrack),
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
          setTrendingByGenreTracks(
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
    { title: "Recently Played", tracks: recentlyPlayedTracks },
    {
      title: "Albums for you",
      tracks: albumTracks,
    },
    {
      title: "Made for you",
      tracks: madeForYouTracks,
    },
    { title: "Trending by genre", tracks: trendingByGenreTracks },
  ];

  const hasAnyTracks =
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
