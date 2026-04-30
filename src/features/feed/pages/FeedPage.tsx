import avatarFallback from "@/assets/avatar.png";
import SideBar from "../../../components/layout/Sidebar";
import SongCard from "../../../components/ui/SongCard";
import { Repeat2 } from "lucide-react";
import type { FeedItem, FeedResponse } from "@/features/feed/type";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { feedService } from "@/features/feed/feedservice";
import { profileService } from "@/features/profile/profileService";
import { useMe } from "@/features/profile/context/useMe";
import { SOCIAL_GRAPH_UPDATED_EVENT } from "@/features/profile/socialGraphEvents";
import { FaUser } from "react-icons/fa";

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

const FEED_CACHE_KEY = "feed_page_cache_v1";

type FeedPageCache = {
  feedItems: FeedItem[];
  page: number;
  hasMore: boolean;
};

function readFeedCache(): FeedPageCache | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(FEED_CACHE_KEY);
    return raw ? (JSON.parse(raw) as FeedPageCache) : null;
  } catch {
    return null;
  }
}

function writeFeedCache(cache: FeedPageCache) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(FEED_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore cache write failures.
  }
}

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
      numberOfReposts: Math.max(existing.numberOfReposts, item.numberOfReposts),
      isReposted: existing.isReposted || item.isReposted,
      action:
        newer.action.action === "repost" || older.action.action !== "repost"
          ? newer.action
          : older.action,
    });
  }

  return Array.from(byTrackId.values());
};

export default function FeedPage() {
  const initialCache = readFeedCache();
  const { me } = useMe();
  const [feedItems, setFeedItems] = useState<FeedItem[]>(
    () => initialCache?.feedItems ?? [],
  );
  const [loading, setLoading] = useState(!initialCache);
  const [error, setError] = useState<string | null>(null);
  const [showReposts, setShowReposts] = useState(true);

  const FEED_PAGE_LIMIT = 20;
  const [page, setPage] = useState(() => initialCache?.page ?? 1);
  const [hasMore, setHasMore] = useState(() => initialCache?.hasMore ?? true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  const lastRequestedPageRef = useRef(1);

  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null);
  const [hoverCardByUserId, setHoverCardByUserId] = useState<Record<string, HoverCardState>>({});
  const [followPendingByUserId, setFollowPendingByUserId] = useState<Record<string, boolean>>({});
  const [hiddenRepostTrackIds, setHiddenRepostTrackIds] = useState<Set<string>>(() => new Set());
  const requestedUserIdsRef = useRef<Set<string>>(new Set());

  const refreshFeed = useCallback(async () => {
    setLoading(feedItems.length === 0);
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

        const nextItems = dedupeFeedByTrackId(data.items);
        setFeedItems(nextItems);
        setPage(data.page ?? 1);
        setHasMore(nextHasMore);
        writeFeedCache({
          feedItems: nextItems,
          page: data.page ?? 1,
          hasMore: nextHasMore,
        });
      } else {
        setFeedItems([]);
        setHasMore(false);
        writeFeedCache({
          feedItems: [],
          page: 1,
          hasMore: false,
        });
      }
    } catch {
      if (feedItems.length === 0) {
        setError("Failed to load feed");
      }
    } finally {
      setLoading(false);
    }
  }, [FEED_PAGE_LIMIT, feedItems.length]);

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
      .getPublicProfile(userId)
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

      setFeedItems((prev) => {
        const nextItems = dedupeFeedByTrackId([...prev, ...data.items]);
        writeFeedCache({
          feedItems: nextItems,
          page: data.page ?? nextPage,
          hasMore: nextHasMore,
        });
        return nextItems;
      });
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

  if (loading && feedItems.length === 0) {
    return (
      <div
        data-testid="feed-loading"
        className="min-h-screen bg-[#0b0b0b] flex items-center justify-center text-white"
      >
        Loading feed...
      </div>
    );
  }

  if (error && feedItems.length === 0) {
    return (
      <div
        data-testid="feed-error"
        className="min-h-screen bg-[#0b0b0b] flex items-center justify-center text-red-500"
      >
        {error}
      </div>
    );
  }

  const visibleItems = showReposts
    ? feedItems
    : feedItems.filter((item) => item.action.action !== "repost");
  const displayItems = visibleItems.filter(
    (item) => !hiddenRepostTrackIds.has(item.trackId),
  );

  return (
    <div data-testid="feed-page" className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="mx-auto flex w-full max-w-[1400px] gap-4 px-3 py-3 sm:gap-8 sm:px-6 sm:py-6 xl:gap-10 xl:px-8 xl:py-8">
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto overflow-x-visible py-1 sm:py-6 xl:ml-6 xl:py-10">
          <div className="mb-5 flex w-full items-start justify-between gap-3 sm:mb-10 sm:items-center xl:max-w-220">
            <p className="min-w-0 flex-1 text-[14px] font-bold leading-snug text-white sm:text-[22px]">
              Hear the latest posts from the people you're following:
            </p>
            <div className="flex shrink-0 items-center gap-2 pr-1 select-none">
              <span className="text-zinc-400 text-[11px] sm:text-base">Reposts</span>
              <button
                data-testid="show-reposts-toggle"
                className={`relative h-5 w-10 shrink-0 rounded-full border transition-colors duration-200 focus:outline-none sm:h-6 sm:w-12 ${
                  showReposts
                    ? "border-orange-500 bg-orange-500"
                    : "border-gray-500 bg-gray-500"
                }`}
                type="button"
                aria-pressed={showReposts}
                onClick={() => setShowReposts((v) => !v)}
              >
                <span
                  className={`absolute left-[2px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-black transition-transform duration-200 sm:h-5 sm:w-5 ${
                    showReposts ? "translate-x-[18px] sm:translate-x-[22px]" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div data-testid="feed-list" className="flex w-full flex-col xl:max-w-220">
            {displayItems.length === 0 && (
              <p data-testid="feed-empty" className="text-gray-500 text-sm mt-10">
                Nothing to show here yet.
              </p>
            )}

            {displayItems.map((item) => {
              const itemRouteId = item.action.id;

              return <div
                key={item.trackId}
                data-testid={`feed-item-${item.trackId}`}
                className="mb-3 flex w-full flex-col items-stretch sm:mb-4"
              >
                <div className="flex items-center gap-1.5 pb-0.5 sm:gap-3 sm:pb-1">
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
                      to={`/${encodeURIComponent(itemRouteId)}`}
                      data-testid={`feed-avatar-link-${item.trackId}`}
                      aria-label={`Open ${item.action.username} profile`}
                    >
                      <img
                        src={item.action.avatarUrl || avatarFallback}
                        alt={item.action.username || item.action.username}
                        data-testid={`feed-avatar-${item.trackId}`}
                        className="h-7 w-7 rounded-full object-cover cursor-pointer sm:h-8 sm:w-8"
                      />
                    </Link>

                    <Link
                      to={`/${encodeURIComponent(itemRouteId)}`}
                      data-testid={`feed-username-link-${item.trackId}`}
                      className="text-[13px] font-semibold text-white hover:text-zinc-300 sm:text-base"
                    >
                      {item.action.username || item.action.username}
                    </Link>

                    {hoveredTrackId === item.trackId && (
                      <div
                        data-testid={`feed-hover-card-${item.trackId}`}
                        className="absolute left-0 top-10 z-30 w-36 rounded-sm border border-zinc-700 bg-[#07090f] p-2 shadow-2xl sm:w-40"
                      >
                        <div className="absolute left-4 top-0 h-3 w-3 -translate-y-1/2 rotate-45 border-l border-t border-zinc-700 bg-[#07090f]" />

                        <Link
                          to={`/${encodeURIComponent(itemRouteId)}`}
                          className="flex flex-col items-center"
                        >
                          <img
                            src={
                              hoverCardByUserId[item.action.id]?.avatarUrl ||
                              item.action.avatarUrl ||
                              avatarFallback
                            }
                            alt={item.action.username}
                            data-testid={`feed-hover-card-avatar-${item.trackId}`}
                            className="h-16 w-16 rounded-full object-cover"
                          />
                          <p className="mt-1.5 text-sm font-bold text-white sm:text-base">
                            {hoverCardByUserId[item.action.id]?.displayName ||
                              item.action.username}
                          </p>
                        </Link>

                        <p className="mt-1.5 flex items-center justify-center gap-1.5 text-zinc-300">
                          <FaUser className="text-xs" />
                          <span className="text-xs font-bold">
                            {(
                              hoverCardByUserId[item.action.id]?.followersCount ?? 0
                            ).toLocaleString()}
                          </span>
                        </p>

                        <p className="mt-1 text-center text-[11px] font-medium leading-snug text-zinc-400 wrap-break-word sm:text-xs">
                          {hoverCardByUserId[item.action.id]?.location || "Unknown location"}
                        </p>

                        {me?.id !== item.action.id && (
                          <button
                            type="button"
                            data-testid={`feed-hover-follow-btn-${item.trackId}`}
                            onClick={() => void handleFollowToggle(item.action.id)}
                            disabled={
                              followPendingByUserId[item.action.id] ||
                              hoverCardByUserId[item.action.id]?.isLoading
                            }
                            className="mt-2 w-full rounded-sm bg-zinc-700 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {hoverCardByUserId[item.action.id]?.isFollowing
                              ? "Following"
                              : "Follow"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <span
                    data-testid={`feed-action-label-${item.trackId}`}
                    className="flex items-center gap-1 text-[10px] text-gray-400 sm:text-xs"
                  >
                    {item.action.action === "repost" && (
                      <Repeat2 className="inline w-4 h-4 text-grey-400 mr-1" />
                    )}
                    {item.action.action === "repost" ? "reposted" : "posted"} a
                    track {formatTimeAgo(item.action.date)}
                  </span>
                </div>

                <div className="flex items-start gap-2 py-1.5 sm:gap-4 sm:py-2">
                  <div className="flex-1 bg-[#181818] rounded-lg">
                    <SongCard
                      trackId={item.trackId}
                      artistLinkTo={item.artistId ? `/${encodeURIComponent(item.artistId)}` : undefined}
                      artistRouteState={item.artistId ? { userId: item.artistId } : undefined}
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
              </div>;
            })}

            {feedItems.length > 0 && (
              <div
                ref={loadMoreSentinelRef}
                data-testid="load-more-sentinel"
                className="h-1 w-full"
              />
            )}

            {loadingMore && (
              <p data-testid="feed-loading-more" className="mt-6 text-sm text-zinc-400">
                Loading more...
              </p>
            )}

            {!loadingMore && !hasMore && feedItems.length > 0 && (
              <p data-testid="feed-caught-up" className="mt-6 text-sm text-zinc-500">
                You're all caught up.
              </p>
            )}
          </div>
        </div>

        <aside className="hidden xl:sticky xl:top-6 xl:block xl:h-[calc(100vh-3rem)] xl:w-90 xl:shrink-0 xl:overflow-y-auto xl:pr-2 xl:[scrollbar-width:none] xl:[-ms-overflow-style:none] xl:[&::-webkit-scrollbar]:hidden">
          <SideBar />
        </aside>
      </div>
    </div>
  );
}
