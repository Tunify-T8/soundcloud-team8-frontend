import avatarFallback from "@/assets/avatar.png";
import SideBar from "../../../components/layout/Sidebar";
import SongCard from "../../../components/ui/SongCard";
import { Repeat2 } from "lucide-react";
import type { FeedItem } from "@/features/feed/type";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { feedService } from "@/features/feed/feedservice";
import { profileService } from "@/features/profile/profileService";
import { useMe } from "@/features/profile/context/useMe";
import { SOCIAL_GRAPH_UPDATED_EVENT } from "@/features/profile/socialGraphEvents";
import { FaUser } from "react-icons/fa";
// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? "s" : ""} ago`;
}

function waveformSeedFromId(id: string): number {
  return id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

type HoverCardState = {
  username: string;
  displayName: string;
  avatarUrl: string;
  followersCount: number;
  location: string;
  isFollowing: boolean;
  isLoading: boolean;
};

const dedupeFeedByTrackId = (items: FeedItem[]): FeedItem[] => {
  const byTrackId = new Map<string, FeedItem>();

  for (const item of items) {
    const existing = byTrackId.get(item.trackId);
    if (!existing) {
      byTrackId.set(item.trackId, item);
      continue;
    }

    const existingTs = new Date(existing.action.date).getTime();
    const incomingTs = new Date(item.action.date).getTime();

    const newer = incomingTs > existingTs ? item : existing;
    const older = incomingTs > existingTs ? existing : item;

    byTrackId.set(item.trackId, {
      ...newer,
      numberOfReposts: Math.max(
        existing.numberOfReposts,
        item.numberOfReposts,
      ),
      isReposted: existing.isReposted || item.isReposted,
      action:
        newer.action.action === "repost" || older.action.action !== "repost"
          ? newer.action
          : older.action,
    });
  }

  return Array.from(byTrackId.values());
};


// ─── Component ────────────────────────────────────────────────────────────────

export default function FeedPage() {
  const { me } = useMe();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReposts, setShowReposts] = useState(true);

  const FEED_PAGE_LIMIT = 20;
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  const lastRequestedPageRef = useRef(1);

  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null);
  const [hoverCardByUserId, setHoverCardByUserId] = useState<
    Record<string, HoverCardState>
  >({});
  const [followPendingByUserId, setFollowPendingByUserId] = useState<
    Record<string, boolean>
  >({});
  const [hiddenRepostTrackIds, setHiddenRepostTrackIds] = useState<Set<string>>(
    () => new Set(),
  );
  const requestedUserIdsRef = useRef<Set<string>>(new Set());

  const refreshFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPage(1);
    setHasMore(true);
    lastRequestedPageRef.current = 1;

    try {
      const data = await feedService.getFeed({ page: 1, limit: FEED_PAGE_LIMIT });

      if (data) {
        const nextHasMore =
          typeof (data as any).hasMore === "boolean"
            ? Boolean((data as any).hasMore)
            : data.items.length === (data.limit ?? FEED_PAGE_LIMIT);

        setFeedItems(dedupeFeedByTrackId(data.items));
        setPage(data.page ?? 1);
        setHasMore(nextHasMore);
      } else {
        setFeedItems([]);
        setHasMore(false);
      }
    } catch {
      setError("Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, [FEED_PAGE_LIMIT]);

  const ensureHoverCardData = async (item: FeedItem) => {
    const userId = item.action.id;
    if (!userId || requestedUserIdsRef.current.has(userId)) return;

    requestedUserIdsRef.current.add(userId);

    setHoverCardByUserId((prev) => ({
      ...prev,
      [userId]: prev[userId] ?? {
        username: item.action.username,
        displayName: item.action.username,
        avatarUrl: item.action.avatarUrl || avatarFallback,
        followersCount: 0,
        location: "",
        isFollowing: false,
        isLoading: true,
      },
    }));

    const profileResult = await profileService
      .getPublicProfile(item.action.username)
      .catch(() => null);

    const followResult =
      me?.id && me.id !== userId
        ? await profileService
            .getFollowStatus(userId)
            .then((s) => s.isFollowing)
            .catch(() => false)
        : false;

    setHoverCardByUserId((prev) => {
      const current = prev[userId];
      if (!current) return prev;

      return {
        ...prev,
        [userId]: {
          username: profileResult?.username ?? current.username,
          displayName:
            profileResult?.displayName?.trim() ||
            profileResult?.username ||
            current.displayName,
          avatarUrl: profileResult?.avatarUrl || current.avatarUrl,
          followersCount: Number(profileResult?.followersCount ?? 0),
          location: profileResult?.location ?? "",
          isFollowing: followResult,
          isLoading: false,
        },
      };
    });
  };

  const handleFollowToggle = async (userId: string) => {
    if (!userId || followPendingByUserId[userId] || me?.id === userId) return;

    const card = hoverCardByUserId[userId];
    if (!card) return;

    setFollowPendingByUserId((prev) => ({ ...prev, [userId]: true }));

    try {
      if (card.isFollowing) {
        await profileService.unfollowUser(userId);
      } else {
        await profileService.followUser(userId);
      }

      setHoverCardByUserId((prev) => {
        const current = prev[userId];
        if (!current) return prev;

        const nextIsFollowing = !current.isFollowing;
        return {
          ...prev,
          [userId]: {
            ...current,
            isFollowing: nextIsFollowing,
            followersCount: Math.max(
              0,
              current.followersCount + (nextIsFollowing ? 1 : -1),
            ),
          },
        };
      });

      window.dispatchEvent(new Event(SOCIAL_GRAPH_UPDATED_EVENT));
    } finally {
      setFollowPendingByUserId((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const loadMore = async () => {
    if (loading || loadingMore || !hasMore) return;

    const nextPage = page + 1;
    if (lastRequestedPageRef.current >= nextPage) return;
    lastRequestedPageRef.current = nextPage;

    setLoadingMore(true);
    try {
      const data = await feedService.getFeed({
        page: nextPage,
        limit: FEED_PAGE_LIMIT,
      });

      if (!data) {
        setHasMore(false);
        return;
      }

      const nextHasMore =
        typeof (data as any).hasMore === "boolean"
          ? Boolean((data as any).hasMore)
          : data.items.length === (data.limit ?? FEED_PAGE_LIMIT);

      setFeedItems((prev) => dedupeFeedByTrackId([...prev, ...data.items]));
      setPage(data.page ?? nextPage);
      setHasMore(nextHasMore);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleRepostToggle = (item: FeedItem) => {
    const trackId = item.trackId;
    if (!trackId) return;

    setFeedItems((prev) =>
      prev.map((i) =>
        i.trackId === trackId
          ? {
              ...i,
              isReposted: !i.isReposted,
              numberOfReposts: i.isReposted
                ? Math.max(0, i.numberOfReposts - 1)
                : i.numberOfReposts + 1,
            }
          : i,
      ),
    );

    const isTurningOff = item.isReposted;
    setHiddenRepostTrackIds((prev) => {
      const next = new Set(prev);
      if (isTurningOff) {
        next.add(trackId);
      } else {
        next.delete(trackId);
      }
      return next;
    });
  };

  useEffect(() => {
    let isMounted = true;

    const fetchFeed = () => {
      if (!isMounted) return;
      void refreshFeed();
    };

    fetchFeed();
    window.addEventListener(SOCIAL_GRAPH_UPDATED_EVENT, fetchFeed);

    return () => {
      window.removeEventListener(SOCIAL_GRAPH_UPDATED_EVENT, fetchFeed);
      isMounted = false;
    };
  }, [refreshFeed]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          void loadMore();
        }
      },
      { root: null, rootMargin: "400px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center text-white">
        Loading feed...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  // Repost filter — your teammate's logic + your state variable name
  const visibleItems = showReposts
    ? feedItems
    : feedItems.filter((item) => item.action.action !== "repost");
  const displayItems = visibleItems.filter(
    (item) => !hiddenRepostTrackIds.has(item.trackId),
  );

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="mx-auto flex w-full max-w-340 gap-10 px-8 py-8">
        <div className="flex-1 flex flex-col py-10 overflow-y-auto overflow-x-visible ml-6">
          {/* Header row */}
          <div className="flex items-center justify-between w-full max-w-220 mb-10">
            <p className="text-[22px] font-bold text-white text-left">
              Hear the latest posts from the people you're following:
            </p>
            <div className="flex items-center gap-2 select-none">
              <span className="text-zinc-400 text-base">Reposts</span>
              <button
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none border-2 ${
                  showReposts
                    ? "bg-orange-500 border-orange-500"
                    : "bg-gray-400 border-gray-400"
                }`}
                type="button"
                aria-pressed={showReposts}
                onClick={() => setShowReposts((v) => !v)}
              >
                <span
                  className="absolute w-5 h-5 bg-black rounded-full transition-all duration-200"
                  style={{
                    left: showReposts ? "calc(100% - 1.25rem)" : "0.25rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
              </button>
            </div>
          </div>

          {/* Track list */}
          <div className="w-full max-w-220 flex flex-col">
            {displayItems.length === 0 && (
              <p className="text-gray-500 text-sm mt-10">
                Nothing to show here yet.
              </p>
            )}

            {displayItems.map((item) => (
              <div
                key={item.trackId}
                className="w-full flex flex-col items-stretch mb-5"
              >
                {/* Avatar + meta row */}
                <div className="flex items-center gap-3 pb-1">
                  <div
                    className="relative flex items-center gap-3"
                    onMouseEnter={() => {
                      setHoveredTrackId(item.trackId);
                      void ensureHoverCardData(item);
                    }}
                    onMouseLeave={() =>
                      setHoveredTrackId((prev) =>
                        prev === item.trackId ? null : prev,
                      )
                    }
                  >
                    <Link
                      to={`/${encodeURIComponent(item.action.id)}`}
                      aria-label={`Open ${item.action.username} profile`}
                    >
                      <img
                        src={item.action.avatarUrl || avatarFallback}
                        alt={item.action.username || item.action.username}
                        className="w-8 h-8 rounded-full object-cover cursor-pointer"
                      />
                    </Link>

                    <Link
                      to={`/${encodeURIComponent(item.action.id)}`}
                      className="font-semibold text-white text-base hover:text-zinc-300"
                    >
                      {item.action.username || item.action.username}
                    </Link>

                    {hoveredTrackId === item.trackId && (
                      <div className="absolute left-0 top-10 z-30 w-40 rounded-sm border border-zinc-700 bg-[#07090f] p-2 shadow-2xl">
                        <div className="absolute left-4 top-0 h-3 w-3 -translate-y-1/2 rotate-45 border-l border-t border-zinc-700 bg-[#07090f]" />

                        <Link
                          to={`/${encodeURIComponent(item.action.id)}`}
                          className="flex flex-col items-center"
                        >
                          <img
                            src={
                              hoverCardByUserId[item.action.id]?.avatarUrl ||
                              item.action.avatarUrl ||
                              avatarFallback
                            }
                            alt={item.action.username}
                            className="h-16 w-16 rounded-full object-cover"
                          />
                          <p className="mt-1.5 text-base font-bold text-white">
                            {hoverCardByUserId[item.action.id]?.displayName ||
                              item.action.username}
                          </p>
                        </Link>

                        <p className="mt-1.5 flex items-center justify-center gap-1.5 text-zinc-300">
                          <FaUser className="text-xs" />
                          <span className="text-xs font-bold">
                            {(
                              hoverCardByUserId[item.action.id]
                                ?.followersCount ?? 0
                            ).toLocaleString()}
                          </span>
                        </p>

                        <p className="mt-1 text-center text-xs font-medium leading-snug text-zinc-400 wrap-break-word">
                          {hoverCardByUserId[item.action.id]?.location ||
                            "Unknown location"}
                        </p>

                        {me?.id !== item.action.id && (
                          <button
                            type="button"
                            onClick={() =>
                              void handleFollowToggle(item.action.id)
                            }
                            disabled={
                              followPendingByUserId[item.action.id] ||
                              hoverCardByUserId[item.action.id]?.isLoading
                            }
                            className="mt-2 w-full rounded-sm bg-zinc-700 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {followPendingByUserId[item.action.id]
                              ? "Please wait..."
                              : hoverCardByUserId[item.action.id]?.isFollowing
                                ? "Following"
                                : "Follow"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    {item.action.action === "repost" && (
                      <Repeat2 className="inline w-4 h-4 text-grey-400 mr-1" />
                    )}
                    {item.action.action === "repost" ? "reposted" : "posted"} a
                    track {formatTimeAgo(item.action.date)}
                  </span>
                </div>

                {/* Track card — your improvements: trackId, isLikedInitial, waveformSeed */}
                <div className="flex gap-4 items-start py-2">
                  <div className="flex-1 bg-[#181818] rounded-lg">
                    <SongCard
                      trackId={item.trackId}
                      isLikedInitial={item.isLiked}
                      isRepostedInitial={item.isReposted}
                      onToggleRepost={() => handleRepostToggle(item)}
                      artistName={item.artist}
                      title={item.title}
                      coverUrl={item.coverUrl ?? undefined}
                      genre={item.genre as any}
                      likes={item.numberOfLikes.toString()}
                      reposts={item.numberOfReposts.toString()}
                      plays={item.numberOfListens.toString()}
                      comments={item.numberOfComments.toString()}
                      timeAgo={formatTimeAgo(item.action.date)}
                      waveformSeed={waveformSeedFromId(item.trackId)}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Infinite scroll sentinel */}
            {feedItems.length > 0 && (
              <div ref={loadMoreSentinelRef} className="h-1 w-full" />
            )}

            {loadingMore && (
              <p className="mt-6 text-sm text-zinc-400">Loading more...</p>
            )}

            {!loadingMore && !hasMore && feedItems.length > 0 && (
              <p className="mt-6 text-sm text-zinc-500">
                You're all caught up.
              </p>
            )}
          </div>
        </div>

        <aside className="sticky top-6 self-start h-[calc(100vh-3rem)] w-90 shrink-0 overflow-y-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <SideBar />
        </aside>
      </div>
    </div>
  );
}
