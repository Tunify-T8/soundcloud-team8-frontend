"use client";
import { useEffect, useState } from "react";
import SideBar from "@/components/layout/Sidebar";
import type { DiscoverResponse } from "@/features/discover/Discover";
import { DiscoverSection } from "../components/DiscoverSection";
import { getDiscoverTracks } from "../discoverService";

export default function DiscoverPage() {
  const [discoverResponse, setDiscoverResponse] = useState<DiscoverResponse>({
    items: [],
    page: 1,
    limit: 20,
    hasMore: false,
    personalized: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDiscoverTracks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getDiscoverTracks({ page: 1, limit: 20 });
        if (isMounted && Array.isArray(response.items)) {
          setDiscoverResponse(response);
        }
      } catch {
        if (isMounted) {
          setError("Could not load discover tracks.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchDiscoverTracks();

    return () => {
      isMounted = false;
    };
  }, []);

  const tracks = discoverResponse.items;
  const discoverSections = [
    { title: "More of what you like", tracks },
    {
      title: "Recently Played",
      tracks: tracks.slice(1).concat(tracks.slice(0, 1)),
    },
    {
      title: "Albums for you",
      tracks: tracks.slice(3).concat(tracks.slice(0, 3)),
    },
    {
      title: "Made for you",
      tracks: tracks.slice(4).concat(tracks.slice(0, 4)),
    },
    {
      title: "Artists to watch out for",
      tracks: tracks.slice(6).concat(tracks.slice(0, 6)),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="mx-auto flex w-full max-w-340 gap-10 px-8 py-8">
        <main className="flex-1 overflow-hidden ml-6">
          {isLoading ? (
            <p className="text-zinc-400">Loading discover tracks...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : tracks.length === 0 ? (
            <p className="text-zinc-400">No discover tracks yet.</p>
          ) : (
            discoverSections.map((section) => (
              <DiscoverSection
                key={section.title}
                title={section.title}
                tracks={section.tracks}
              />
            ))
          )}
        </main>

        <aside className="w-90 shrink-0">
          <SideBar />
        </aside>
      </div>
    </div>
  );
}
