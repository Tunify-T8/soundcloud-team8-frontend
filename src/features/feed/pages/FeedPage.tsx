import SideBar from "../../../components/layout/Sidebar";
import SongCard from "../../../components/ui/SongCard";
import type { Track } from "@/shared/types/Track";
import { useEffect, useState } from "react";
import { feedService } from "../feedservice";

export default function FeedPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReposts, setShowReposts] = useState(true);

  useEffect(() => {
    let isMounted = true;
    feedService
      .getFeedTracks()
      .then((data) => {
        if (isMounted) {
          setTracks(data);
          setLoading(false);
        }
      })
      .catch((err) => {
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
          {tracks.map((track, idx) => (
            <div
              key={track.id}
              className="w-full flex flex-col items-stretch mb-5"
            >
              {/* Avatar and meta row above the card */}
              <div className="flex items-center gap-3 pb-1">
                <img
                  src={track.thumbnailUrl || "https://i.pravatar.cc/100"}
                  alt={track.artist}
                  className="w-8 h-8 rounded-full object-cover "
                />
                <span className="font-semibold text-white text-base">
                  {track.artist}
                </span>
                <span className="text-xs text-gray-400">posted a track</span>
                <span className="text-xs text-gray-500 ml-2">2 days ago</span>
              </div>
              <div className="flex gap-4 items-start py-2">
                <div className="flex-1">
                  <div className="bg-[#181818] rounded-lg">
                    <SongCard
                      artistName={track.artist}
                      title={track.title}
                      coverUrl={track.thumbnailUrl || undefined}
                      genre={track.genre}
                      likes={track.likes?.toString()}
                      reposts={track.reposts?.toString()}
                      plays={track.plays?.toString()}
                      comments={track.comments?.toString()}
                      timeAgo={track.date}
                      waveformSeed={track.id.length}
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
