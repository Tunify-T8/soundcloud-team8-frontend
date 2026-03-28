import { Heart, SkipBack, SkipForward, Play, Pause, Shuffle, MessageCircle, Volume2, UserPlus2, LayoutList } from "lucide-react";
import { usePlayer } from "../context/usePlayer";

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export default function PlayerBar() {
  const { currentTrack, isPlaying, progress, setIsPlaying, setProgress } = usePlayer();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-14 bg-[#0a0a0a] border-t border-zinc-800 z-50 flex items-center px-4 gap-4">

      {/* Playback controls */}
      <div className="flex items-center gap-4 shrink-0">
        <SkipBack size={18} className="text-zinc-400 hover:text-white cursor-pointer" />
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center hover:border-zinc-300 transition-colors"
        >
          {isPlaying
            ? <Pause size={14} fill="white" className="text-white" />
            : <Play size={14} fill="white" className="text-white ml-0.5" />
          }
        </button>
        <SkipForward size={18} className="text-zinc-400 hover:text-white cursor-pointer" />
        <Shuffle size={16} className="text-zinc-400 hover:text-white cursor-pointer" />
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs text-zinc-400 shrink-0 w-8 text-right">{formatTime(progress)}</span>
        <div
          className="relative flex-1 h-1 bg-zinc-700 rounded-full cursor-pointer group"
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
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${(progress / currentTrack.duration) * 100}% - 6px)` }}
          />
        </div>
        <span className="text-xs text-zinc-400 shrink-0 w-8">{formatTime(currentTrack.duration)}</span>
      </div>

      {/* Comment + Volume */}
      <MessageCircle size={17} className="text-zinc-400 hover:text-white cursor-pointer shrink-0" />
      <Volume2 size={17} className="text-zinc-400 hover:text-white cursor-pointer shrink-0" />

      <div className="flex items-center gap-3 shrink-0 ml-2">
        {currentTrack.thumbnailUrl && (
          <img src={currentTrack.thumbnailUrl} alt="cover" className="w-9 h-9 rounded object-cover bg-zinc-700" />
        )}
        <div className="flex flex-col leading-tight">
          <span className="text-xs text-zinc-400 leading-none">{currentTrack.artist}</span>
          <span className="text-sm font-bold text-white leading-none mt-0.5">{currentTrack.title}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4 shrink-0">
        <Heart size={17} className="text-orange-500 cursor-pointer hover:text-orange-400" />
        <UserPlus2 size={17} className="text-zinc-400 hover:text-white cursor-pointer" />
        <LayoutList size={17} className="text-zinc-400 hover:text-white cursor-pointer" />
      </div>
    </div>
  );
}