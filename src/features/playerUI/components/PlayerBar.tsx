import { Heart, SkipBack, SkipForward, Play, Pause, Shuffle, Repeat2, Volume2, UserPlus2, LayoutList } from "lucide-react";
import { usePlayer } from "../context/usePlayer";
import { useState } from "react";

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export default function PlayerBar() {
  const { currentTrack, isPlaying, progress, setIsPlaying, setProgress } = usePlayer();
  const [volume, setVolume] = useState(1); // 0 to 1
  const [showVolume, setShowVolume] = useState(false);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-[#222] border-t border-zinc-700 z-50 flex items-center px-6 gap-5">

      <div className="flex items-center gap-4 shrink-0">
        <SkipBack size={16} className="text-white hover:text-zinc-300 cursor-pointer" />
        <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-zinc-300">
          {isPlaying
            ? <Pause size={18} fill="white" className="text-white" />
            : <Play size={18} fill="white" className="text-white ml-0.5" />
          }
        </button>
        <SkipForward size={16} className="text-white hover:text-zinc-300 cursor-pointer" />
        <Shuffle size={15} className="text-white hover:text-zinc-300 cursor-pointer" />
        <Repeat2 size={15} className="text-white hover:text-zinc-300 cursor-pointer" />
      </div>

      {/* Progress bar + times */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs text-zinc-400 shrink-0 w-8 text-right">{formatTime(progress)}</span>
        <div
          className="relative flex-1 h-[3px] bg-zinc-600 rounded-full cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            setProgress(Math.round(pct * currentTrack.duration));
          }}
        >
          <div
            className="absolute left-0 top-0 h-full bg-orange-500 rounded-full"
            style={{ width: `${(progress / currentTrack.duration) * 100}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${(progress / currentTrack.duration) * 100}% - 5px)` }}
          />
        </div>
        <span className="text-xs text-zinc-400 shrink-0 w-8">{formatTime(currentTrack.duration)}</span>
      </div>

      {/* Volume with vertical slider popup */}
      <div
        className="relative shrink-0"
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
      >
        {/* Vertical slider popup */}
        {showVolume && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#2a2a2a] rounded-lg px-3 pt-3 pb-2 flex flex-col items-center shadow-xl"
            style={{ height: "110px" }}
          >
      
            <div
              className="relative w-[3px] bg-zinc-600 rounded-full cursor-pointer flex-1"
              style={{ width: "3px" }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = 1 - (e.clientY - rect.top) / rect.height;
                setVolume(Math.max(0, Math.min(1, pct)));
              }}
            >

              <div
                className="absolute bottom-0 left-0 w-full bg-white rounded-full"
                style={{ height: `${volume * 100}%` }}
              />
              <div
                className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-black border border-white rounded-full shadow"
                style={{ bottom: `calc(${volume * 100}% - 6px)` }}
              />
            </div>
          </div>
        )}

        <Volume2 size={15} className="text-white hover:text-zinc-300 cursor-pointer" />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {currentTrack.thumbnailUrl && (
          <img src={currentTrack.thumbnailUrl} alt="cover" className="w-8 h-8 object-cover" />
        )}
        <div className="flex flex-col leading-tight">
          <span className="text-xs text-zinc-400 leading-none">{currentTrack.artist}</span>
          <span className="text-xs font-bold text-white leading-none mt-0.5">{currentTrack.title}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
       <Heart size={15} fill="#FF5500" className="cursor-pointer hover:opacity-80" style={{ color: "#FF5500" }} />
       <UserPlus2 size={15} className="cursor-pointer hover:opacity-80" style={{ color: "#FF5500" }} />
        <LayoutList size={15} className="text-white hover:text-zinc-300 cursor-pointer" />
      </div>

    </div>
  );
}