"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion"; // Imported as type
import SideBar from "@/components/layout/Sidebar";
import type {
  DiscoverArtist,
  DiscoverTrack,
  RecommendationItemDto,
} from "@/features/discover/Discover";
import { ArtistsToWatchSection } from "../components/ArtistsToWatchSection";
import { DiscoverSection } from "../components/DiscoverSection";
import { LatestUploadSection } from "../components/LatestUploadSection";
import {
  getDiscoverTracks,
  getRecommendations,
  getSuggestedArtists,
  getTrendingAlbums,
  getTrendingTracks,
} from "../discoverService";
import { usePlayContext } from "@/hooks/usePlayContext";
import { useMe } from "@/features/profile/context/useMe";
import { trackService } from "@/features/track-management/trackService";
import type { Track } from "@/shared/types/Track";

const DISCOVER_CACHE_KEY = "discover_page_cache_v1";

// --- Animation Variants ---
const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Cascades the entrance of each section
    },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const sidebarVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, delay: 0.4, ease: "easeOut" },
  },
};

type DiscoverPageCache = {
  discoverTracks: DiscoverTrack[];
  albumTracks: DiscoverTrack[];
  madeForYouTracks: DiscoverTrack[];
  trendingByGenreTracks: DiscoverTrack[];
  artistsToWatchTracks: DiscoverArtist[];
  uploadedTracks: Track[];
};

function readDiscoverCache(): DiscoverPageCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DISCOVER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as DiscoverPageCache) : null;
  } catch {
    return null;
  }
}

function writeDiscoverCache(cache: DiscoverPageCache) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DISCOVER_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

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
  const initialCache = useMemo(() => readDiscoverCache(), []);
  const [discoverTracks, setDiscoverTracks] = useState<DiscoverTrack[]>(
    () => initialCache?.discoverTracks ?? [],
  );
  const [recentlyPlayedTracks] = useState<DiscoverTrack[]>(
    loadRecentlyPlayedFromStorage,
  );
  const [albumTracks, setAlbumTracks] = useState<DiscoverTrack[]>(
    () => initialCache?.albumTracks ?? [],
  );
  const [madeForYouTracks, setMadeForYouTracks] = useState<DiscoverTrack[]>(
    () => initialCache?.madeForYouTracks ?? [],
  );
  const [trendingByGenreTracks, setTrendingByGenreTracks] = useState<
    DiscoverTrack[]
  >(() => initialCache?.trendingByGenreTracks ?? []);
  const [uploadedTracks, setUploadedTracks] = useState<Track[]>(
    () => initialCache?.uploadedTracks ?? [],
  );
  const [artistsToWatchTracks, setArtistsToWatchTracks] = useState<
    DiscoverArtist[]
  >(() => initialCache?.artistsToWatchTracks ?? []);
  const [isLoading, setIsLoading] = useState(!initialCache);
  const [error, setError] = useState<string | null>(null);
  const { me } = useMe();
  
  usePlayContext({ contextType: "feed", contextId: me?.id ?? "" });

  useEffect(() => {
    let isMounted = true;
    const fetchDiscoverData = async () => {
      try {
        setError(null);
        const results = await Promise.allSettled([
          getDiscoverTracks({ page: 1, limit: 20 }),
          getRecommendations({ page: 1, limit: 20 }),
          getSuggestedArtists({ page: 1, limit: 10 }),
          getTrendingAlbums({ period: "month" }),
          getTrendingTracks({ type: "track", period: "month" }),
        ]);

        if (!isMounted) return;

        const nextDiscoverTracks =
          results[0].status === "fulfilled" && Array.isArray(results[0].value.items)
            ? results[0].value.items
            : discoverTracks;
        const nextMadeForYouTracks =
          results[1].status === "fulfilled" && Array.isArray(results[1].value.data)
            ? results[1].value.data.map(mapRecommendationToDiscoverTrack)
            : madeForYouTracks;
        const nextArtistsToWatchTracks =
          results[2].status === "fulfilled" && Array.isArray(results[2].value.items)
            ? results[2].value.items
            : artistsToWatchTracks;
        const nextAlbumTracks =
          results[3].status === "fulfilled" && Array.isArray(results[3].value.items)
            ? results[3].value.items
            : albumTracks;
        const nextTrendingByGenreTracks =
          results[4].status === "fulfilled" && Array.isArray(results[4].value.items)
            ? results[4].value.items
            : trendingByGenreTracks;

        setDiscoverTracks(nextDiscoverTracks);
        setMadeForYouTracks(nextMadeForYouTracks);
        setArtistsToWatchTracks(nextArtistsToWatchTracks);
        setAlbumTracks(nextAlbumTracks);
        setTrendingByGenreTracks(nextTrendingByGenreTracks);

        writeDiscoverCache({
          discoverTracks: nextDiscoverTracks,
          albumTracks: nextAlbumTracks,
          madeForYouTracks: nextMadeForYouTracks,
          trendingByGenreTracks: nextTrendingByGenreTracks,
          artistsToWatchTracks: nextArtistsToWatchTracks,
          uploadedTracks,
        });
      } catch {
        if (!isMounted || initialCache) return;
        setError("Could not load discover data.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void fetchDiscoverData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    trackService.getUploadedTracks().then((tracks) => {
      if (!isMounted) return;
      const nextUploadedTracks = Array.isArray(tracks) ? tracks : [];
      setUploadedTracks(nextUploadedTracks);
      writeDiscoverCache({
        discoverTracks,
        albumTracks,
        madeForYouTracks,
        trendingByGenreTracks,
        artistsToWatchTracks,
        uploadedTracks: nextUploadedTracks,
      });
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [discoverTracks, albumTracks, madeForYouTracks, trendingByGenreTracks, artistsToWatchTracks]);

  const latestUploadedTrack = useMemo(() => {
    if (uploadedTracks.length === 0) return null;
    return [...uploadedTracks].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )[0] ?? null;
  }, [uploadedTracks]);

  const discoverSections = [
    { title: "More of what you like", tracks: discoverTracks },
    { title: "Recently Played", tracks: recentlyPlayedTracks },
    { title: "Albums for you", tracks: albumTracks },
    { title: "Made for you", tracks: madeForYouTracks },
    { title: "Trending by genre", tracks: trendingByGenreTracks },
  ];

  const hasAnyTracks =
    latestUploadedTrack !== null ||
    discoverSections.some((section) => section.tracks.length > 0) ||
    artistsToWatchTracks.length > 0;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="min-h-screen bg-[#0b0b0b] text-white"
    >
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-3 py-4 sm:px-6 sm:py-8 xl:flex-row xl:gap-10 xl:px-8">
        <main className="min-w-0 flex-1 overflow-hidden">
          {isLoading && !hasAnyTracks ? (
            <p className="text-zinc-400">Loading discover tracks...</p>
          ) : error && !hasAnyTracks ? (
            <p className="text-red-400">{error}</p>
          ) : !hasAnyTracks ? (
            <p className="text-zinc-400">No discover tracks yet.</p>
          ) : (
            <>
              {latestUploadedTrack && (
                <motion.div variants={sectionVariants}>
                  <LatestUploadSection
                    track={latestUploadedTrack}
                    artistName={me?.displayName || me?.username || latestUploadedTrack.artist}
                    onTrackUpdated={(updatedTrack) => {
                      setUploadedTracks((prev) => prev.map((t) => t.id === updatedTrack.id ? updatedTrack : t));
                    }}
                    onTrackDeleted={(trackId) => {
                      setUploadedTracks((prev) => prev.filter((t) => t.id !== trackId));
                    }}
                  />
                </motion.div>
              )}
              
              {discoverSections.map((section) => (
                <motion.div key={section.title} variants={sectionVariants}>
                  <DiscoverSection title={section.title} tracks={section.tracks} />
                </motion.div>
              ))}

              <motion.div variants={sectionVariants}>
                <ArtistsToWatchSection
                  title="Artists to watch out for"
                  artists={artistsToWatchTracks}
                />
              </motion.div>
            </>
          )}
        </main>

        <motion.aside 
          variants={sidebarVariants}
          className="hidden xl:sticky xl:top-6 xl:block xl:h-[calc(100vh-3rem)] xl:w-90 xl:shrink-0 xl:overflow-y-auto xl:pr-2 xl:[scrollbar-width:none] xl:[-ms-overflow-style:none] xl:[&::-webkit-scrollbar]:hidden"
        >
          <SideBar />
        </motion.aside>
      </div>
    </motion.div>
  );
}