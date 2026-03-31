import { useEffect, useState } from "react";
import SideBar from "@/components/layout/Sidebar";
import type { GetDiscoverParams } from "../discoverService";
import { getDiscoverTracks } from "../discoverService";
import type { DiscoverTrack, DiscoverResponse } from "@/shared/types/Discover";

export default function DiscoverPage() {
  const [tracks, setTracks] = useState<DiscoverTrack[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getDiscoverTracks({ page, limit })
      .then((data: DiscoverResponse) => {
        setTracks(data.items);
        setHasMore(data.hasMore);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load discover tracks");
        setLoading(false);
      });
  }, [page, limit]);

  return (
  <div>
    <p>Discover Page</p>
    <SideBar />
  </div>
  );
}
