import SideBar from "../../../components/layout/Sidebar";
import SongCard from "../../../components/ui/SongCard";
import { Repeat2 } from "lucide-react";
import type { FeedItem, FeedResponse } from "@/shared/types/Feed";
import { useEffect, useState } from "react";
import { feedService } from "../feedService";

export default function FeedPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReposts, setShowReposts] = useState(true);

  useEffect(() => {
    let isMounted = true;
    feedService
      .getFeed()
      .then((data: FeedResponse | null) => {
        if (isMounted) {
          if (data) {
            setFeedItems(data.items);
            setPage(data.page);
            setLimit(data.limit);
            setHasMore(data.hasMore);
          } else {
            setFeedItems([]);
            setPage(1);
            setLimit(20);
            setHasMore(false);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load feed");
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center text-white">
        Loading feed...
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] flex">
      <div className="flex-1 flex flex-col items-center py-10 mr-9 overflow-y-auto">
        <div className="flex items-center justify-between w-full max-w-[880px] ml-[135px] mb-10">
          <p className="text-[22px] font-bold text-white text-left">
            Hear the latest posts from the people you’re following:
          </p>
          <div className="flex items-center gap-2 select-none">
            <span className="text-zinc-400 text-base">Reposts</span>
            <button
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none border-2 ${showReposts ? "bg-orange-500 border-orange-500" : "bg-gray-400 border-gray-400"}`}
              title="Toggle Reposts"
              tabIndex={0}
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
              ></span>
            </button>
          </div>
        </div>
        <div className="w-full max-w-[880px] flex flex-col items-center ml-[135px]">
          {(showReposts
            ? feedItems
            : feedItems.filter((item) => item.action.action !== "repost")
          ).map((item) => (
            <div
              key={item.id}
              className="w-full flex flex-col items-stretch mb-5"
            >
              {/* Avatar and meta row above the card */}
              <div className="flex items-center gap-3 pb-1">
                <img
                  src={item.action.userAvatarUrl || "https://i.pravatar.cc/100"}
                  alt={item.action.displayName || item.action.username}
                  className="w-8 h-8 rounded-full object-cover "
                />
                <span className="font-semibold text-white text-base">
                  {item.action.displayName || item.action.username}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  {item.action.action === "repost" && (
                    <Repeat2 className="inline w-4 h-4 text-green-400 mr-1" />
                  )}
                  {item.action.action === "repost" ? "reposted" : "posted"} a
                  track
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {new Date(item.action.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-4 items-start py-2">
                <div className="flex-1">
                  <div className="bg-[#181818] rounded-lg">
                    <SongCard
                      artistName={item.artist}
                      title={item.title}
                      coverUrl={item.coverUrl || undefined}
                      genre={item.genre}
                      likes={item.numberOfLikes.toString()}
                      reposts={item.numberOfReposts.toString()}
                      plays={item.numberOfListens.toString()}
                      comments={item.numberOfComments.toString()}
                      timeAgo={new Date(item.action.date).toLocaleDateString()}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-[460px]  bg-[#181818]">
        <SideBar />
      </div>
    </div>
  );
}
